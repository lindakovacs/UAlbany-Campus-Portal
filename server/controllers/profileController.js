const {
  ValidationError,
  NotFoundError,
  AuthenticationError,
  ApiError,
} = require('../utils/errors');
const {
  parseProfileJSON,
  parseProfilesJSON,
} = require('../utils/profileHelpers');

/**
 * Get a user profile by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(userId)) {
      throw new ValidationError('Invalid user ID');
    }

    const pool = req.db;
    const [profiles] = await pool.query(
      `SELECT p.id, p.user_id, u.name, p.title, p.company, p.website, p.location, 
              p.bio, p.skills, p.social_links, p.created_at, p.updated_at 
       FROM profiles p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ?`,
      [userId],
    );

    if (profiles.length === 0) {
      throw new NotFoundError('Profile not found');
    }

    const profile = parseProfileJSON(profiles[0]);

    res.status(200).json({
      status: 'success',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a user profile (protected - owner only)
 * @param {Object} req - Express request object with authenticated user
 * @param {Object} res - Express response object
 */
const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { bio, skills, social_links, company, location, title } = req.body;

    if (!userId || isNaN(userId)) {
      throw new ValidationError('Invalid user ID');
    }

    // Verify user is updating their own profile
    if (req.user.id !== parseInt(userId)) {
      throw new AuthenticationError('You can only update your own profile');
    }

    // Validate inputs
    if (bio !== undefined && typeof bio !== 'string') {
      throw new ValidationError('Bio must be a string');
    }
    if (bio && bio.length > 500) {
      throw new ValidationError('Bio must be less than 500 characters');
    }
    if (company !== undefined && typeof company !== 'string') {
      throw new ValidationError('Company must be a string');
    }
    if (location !== undefined && typeof location !== 'string') {
      throw new ValidationError('Location must be a string');
    }
    if (title !== undefined && typeof title !== 'string') {
      throw new ValidationError('Title must be a string');
    }

    const pool = req.db;

    // Check if profile exists, auto-create if not
    const [profiles] = await pool.query(
      'SELECT id FROM profiles WHERE user_id = ?',
      [userId],
    );

    if (profiles.length === 0) {
      // Auto-create profile if it doesn't exist
      console.log(`Auto-creating profile for user ${userId}`);
      try {
        await pool.query('INSERT INTO profiles (user_id) VALUES (?)', [userId]);
      } catch (insertError) {
        console.error('Error auto-creating profile:', insertError);
        throw new ApiError('Failed to create profile', 500, {
          error: insertError.message,
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (company !== undefined) {
      updates.push('company = ?');
      values.push(company);
    }
    if (location !== undefined) {
      updates.push('location = ?');
      values.push(location);
    }
    if (skills !== undefined) {
      updates.push('skills = ?');
      values.push(typeof skills === 'string' ? skills : JSON.stringify(skills));
    }
    if (social_links !== undefined) {
      updates.push('social_links = ?');
      values.push(
        typeof social_links === 'string'
          ? social_links
          : JSON.stringify(social_links),
      );
    }

    if (updates.length === 0) {
      throw new ValidationError('No fields to update');
    }

    updates.push('updated_at = NOW()');
    values.push(userId);

    const query = `UPDATE profiles SET ${updates.join(', ')} WHERE user_id = ?`;
    await pool.query(query, values);

    // Fetch updated profile with user info
    const [updatedProfiles] = await pool.query(
      `SELECT p.id, p.user_id, u.name, p.title, p.company, p.website, p.location, 
              p.bio, p.skills, p.social_links, p.created_at, p.updated_at 
       FROM profiles p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ?`,
      [userId],
    );

    const profile = parseProfileJSON(updatedProfiles[0]);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all profiles with pagination
 * @param {Object} req - Express request object with optional query params
 * @param {Object} res - Express response object
 */
const listProfiles = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const pool = req.db;

    // Get total count
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM profiles',
    );
    const total = countResult[0].total;

    // Fetch paginated profiles with user names
    const [profiles] = await pool.query(
      `SELECT 
        p.id, 
        p.user_id, 
        u.name, 
        u.email, 
        p.bio, 
        p.skills, 
        p.social_links, 
        p.created_at, 
        p.updated_at 
      FROM profiles p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC 
      LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    // Parse JSON fields for all profiles
    const parsedProfiles = parseProfilesJSON(profiles);

    res.status(200).json({
      status: 'success',
      data: parsedProfiles,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload/Update profile photo
 * @param {Object} req - Express request object with user.id and photoData in body
 * @param {Object} res - Express response object
 */
const uploadProfilePhoto = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { photoData } = req.body;

    // Validate photo data
    if (!photoData) {
      throw new ValidationError('Photo data is required');
    }

    if (typeof photoData !== 'string' || !photoData.startsWith('data:')) {
      throw new ValidationError(
        'Invalid photo format. Must be base64 encoded data URL.',
      );
    }

    // Limit photo size (max ~2MB when encoded)
    if (photoData.length > 2500000) {
      throw new ValidationError('Photo is too large. Maximum size is ~2MB.');
    }

    const pool = req.db;

    // Check if profile exists
    const [profiles] = await pool.query(
      'SELECT id FROM profiles WHERE user_id = ?',
      [userId],
    );

    if (profiles.length === 0) {
      throw new NotFoundError('Profile not found');
    }

    // Update profile photo
    const [result] = await pool.query(
      'UPDATE profiles SET profile_photo = ? WHERE user_id = ?',
      [photoData, userId],
    );

    res.status(200).json({
      status: 'success',
      message: 'Profile photo updated successfully',
      data: {
        user_id: userId,
        photo_updated: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  listProfiles,
  uploadProfilePhoto,
};
