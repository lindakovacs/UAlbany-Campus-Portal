const { ValidationError, NotFoundError, AuthenticationError, ApiError } = require('../utils/errors');
const { parseProfileJSON, parseProfilesJSON } = require('../utils/profileHelpers');

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
      'SELECT id, user_id, bio, skills, social_links, created_at, updated_at FROM profiles WHERE user_id = ?',
      [userId]
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
    const { bio, skills, social_links } = req.body;

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

    const pool = req.db;

    // Check if profile exists
    const [profiles] = await pool.query(
      'SELECT id FROM profiles WHERE user_id = ?',
      [userId]
    );

    if (profiles.length === 0) {
      throw new NotFoundError('Profile not found');
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (skills !== undefined) {
      updates.push('skills = ?');
      values.push(typeof skills === 'string' ? skills : JSON.stringify(skills));
    }
    if (social_links !== undefined) {
      updates.push('social_links = ?');
      values.push(typeof social_links === 'string' ? social_links : JSON.stringify(social_links));
    }

    if (updates.length === 0) {
      throw new ValidationError('No fields to update');
    }

    updates.push('updated_at = NOW()');
    values.push(userId);

    const query = `UPDATE profiles SET ${updates.join(', ')} WHERE user_id = ?`;
    await pool.query(query, values);

    // Fetch updated profile
    const [updatedProfiles] = await pool.query(
      'SELECT id, user_id, bio, skills, social_links, created_at, updated_at FROM profiles WHERE user_id = ?',
      [userId]
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
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM profiles');
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
      [limit, offset]
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

module.exports = {
  getProfile,
  updateProfile,
  listProfiles,
};
