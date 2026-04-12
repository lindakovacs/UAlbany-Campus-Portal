const {
  ValidationError,
  NotFoundError,
  AuthenticationError,
} = require('../utils/errors');

/**
 * Get user's work experience
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getExperience = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(userId)) {
      throw new ValidationError('Invalid user ID');
    }

    const pool = req.db;
    const [experience] = await pool.query(
      `SELECT id, user_id, company, title, location, 
       from_date, to_date, current, description, created_at 
       FROM experience WHERE user_id = ? ORDER BY from_date DESC`,
      [userId],
    );

    res.status(200).json({
      status: 'success',
      data: experience,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add work experience entry (protected)
 * @param {Object} req - Express request object with authenticated user
 * @param {Object} res - Express response object
 */
const addExperience = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const {
      company,
      title,
      location,
      from_date,
      to_date,
      current,
      description,
    } = req.body;

    if (!userId || isNaN(userId)) {
      throw new ValidationError('Invalid user ID');
    }

    // Verify user is adding to their own profile
    if (req.user.id !== parseInt(userId)) {
      throw new AuthenticationError(
        'You can only add experience to your own profile',
      );
    }

    // Validate required fields
    if (
      !company ||
      typeof company !== 'string' ||
      company.trim().length === 0
    ) {
      throw new ValidationError('Company name is required');
    }
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw new ValidationError('Job title is required');
    }
    if (!from_date) {
      throw new ValidationError('From date is required');
    }

    const pool = req.db;

    // Insert experience record
    const [result] = await pool.query(
      `INSERT INTO experience (user_id, company, title, location, from_date, to_date, current, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        company.trim(),
        title.trim(),
        location || null,
        from_date,
        to_date || null,
        current || false,
        description || null,
      ],
    );

    res.status(201).json({
      status: 'success',
      message: 'Experience entry added successfully',
      data: {
        id: result.insertId,
        user_id: parseInt(userId),
        company: company.trim(),
        title: title.trim(),
        location: location || null,
        from_date,
        to_date: to_date || null,
        current: current || false,
        description: description || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update experience entry (protected, owner only)
 * @param {Object} req - Express request object with authenticated user
 * @param {Object} res - Express response object
 */
const updateExperience = async (req, res, next) => {
  try {
    const { experienceId } = req.params;
    const {
      company,
      title,
      location,
      from_date,
      to_date,
      current,
      description,
    } = req.body;

    if (!experienceId || isNaN(experienceId)) {
      throw new ValidationError('Invalid experience ID');
    }

    const pool = req.db;

    // Get experience record to verify ownership
    const [records] = await pool.query(
      'SELECT user_id FROM experience WHERE id = ?',
      [experienceId],
    );

    if (records.length === 0) {
      throw new NotFoundError('Experience entry not found');
    }

    if (records[0].user_id !== req.user.id) {
      throw new AuthenticationError(
        'You can only update your own experience entries',
      );
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (company !== undefined) {
      updates.push('company = ?');
      values.push(company);
    }
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (location !== undefined) {
      updates.push('location = ?');
      values.push(location);
    }
    if (from_date !== undefined) {
      updates.push('from_date = ?');
      values.push(from_date);
    }
    if (to_date !== undefined) {
      updates.push('to_date = ?');
      values.push(to_date);
    }
    if (current !== undefined) {
      updates.push('current = ?');
      values.push(current);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }

    if (updates.length === 0) {
      throw new ValidationError('No fields to update');
    }

    values.push(experienceId);
    const query = `UPDATE experience SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(query, values);

    // Fetch updated record
    const [updated] = await pool.query(
      'SELECT id, user_id, company, title, location, from_date, to_date, current, description, created_at FROM experience WHERE id = ?',
      [experienceId],
    );

    res.status(200).json({
      status: 'success',
      message: 'Experience entry updated successfully',
      data: updated[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete experience entry (protected, owner only)
 * @param {Object} req - Express request object with authenticated user
 * @param {Object} res - Express response object
 */
const deleteExperience = async (req, res, next) => {
  try {
    const { experienceId } = req.params;

    if (!experienceId || isNaN(experienceId)) {
      throw new ValidationError('Invalid experience ID');
    }

    const pool = req.db;

    // Get experience record to verify ownership
    const [records] = await pool.query(
      'SELECT user_id FROM experience WHERE id = ?',
      [experienceId],
    );

    if (records.length === 0) {
      throw new NotFoundError('Experience entry not found');
    }

    if (records[0].user_id !== req.user.id) {
      throw new AuthenticationError(
        'You can only delete your own experience entries',
      );
    }

    await pool.query('DELETE FROM experience WHERE id = ?', [experienceId]);

    res.status(200).json({
      status: 'success',
      message: 'Experience entry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExperience,
  addExperience,
  updateExperience,
  deleteExperience,
};
