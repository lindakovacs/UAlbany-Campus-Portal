const {
  ValidationError,
  NotFoundError,
  AuthenticationError,
} = require('../utils/errors');

/**
 * Get user's education history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEducation = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(userId)) {
      throw new ValidationError('Invalid user ID');
    }

    const pool = req.db;
    const [education] = await pool.query(
      `SELECT id, user_id, school, degree, field_of_study, 
       from_date, to_date, current, description, created_at 
       FROM education WHERE user_id = ? ORDER BY from_date DESC`,
      [userId],
    );

    res.status(200).json({
      status: 'success',
      data: education,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add education entry (protected)
 * @param {Object} req - Express request object with authenticated user
 * @param {Object} res - Express response object
 */
const addEducation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const {
      school,
      degree,
      field_of_study,
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
        'You can only add education to your own profile',
      );
    }

    // Validate required fields
    if (!school || typeof school !== 'string' || school.trim().length === 0) {
      throw new ValidationError('School name is required');
    }
    if (!degree || typeof degree !== 'string' || degree.trim().length === 0) {
      throw new ValidationError('Degree is required');
    }
    if (!from_date) {
      throw new ValidationError('From date is required');
    }

    const pool = req.db;

    // Insert education record
    const [result] = await pool.query(
      `INSERT INTO education (user_id, school, degree, field_of_study, from_date, to_date, current, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        school.trim(),
        degree.trim(),
        field_of_study || null,
        from_date,
        to_date || null,
        current || false,
        description || null,
      ],
    );

    res.status(201).json({
      status: 'success',
      message: 'Education entry added successfully',
      data: {
        id: result.insertId,
        user_id: parseInt(userId),
        school: school.trim(),
        degree: degree.trim(),
        field_of_study: field_of_study || null,
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
 * Update education entry (protected, owner only)
 * @param {Object} req - Express request object with authenticated user
 * @param {Object} res - Express response object
 */
const updateEducation = async (req, res, next) => {
  try {
    const { educationId } = req.params;
    const {
      school,
      degree,
      field_of_study,
      from_date,
      to_date,
      current,
      description,
    } = req.body;

    if (!educationId || isNaN(educationId)) {
      throw new ValidationError('Invalid education ID');
    }

    const pool = req.db;

    // Get education record to verify ownership
    const [records] = await pool.query(
      'SELECT user_id FROM education WHERE id = ?',
      [educationId],
    );

    if (records.length === 0) {
      throw new NotFoundError('Education entry not found');
    }

    if (records[0].user_id !== req.user.id) {
      throw new AuthenticationError(
        'You can only update your own education entries',
      );
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (school !== undefined) {
      updates.push('school = ?');
      values.push(school);
    }
    if (degree !== undefined) {
      updates.push('degree = ?');
      values.push(degree);
    }
    if (field_of_study !== undefined) {
      updates.push('field_of_study = ?');
      values.push(field_of_study);
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

    values.push(educationId);
    const query = `UPDATE education SET ${updates.join(', ')} WHERE id = ?`;
    await pool.query(query, values);

    // Fetch updated record
    const [updated] = await pool.query(
      'SELECT id, user_id, school, degree, field_of_study, from_date, to_date, current, description, created_at FROM education WHERE id = ?',
      [educationId],
    );

    res.status(200).json({
      status: 'success',
      message: 'Education entry updated successfully',
      data: updated[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete education entry (protected, owner only)
 * @param {Object} req - Express request object with authenticated user
 * @param {Object} res - Express response object
 */
const deleteEducation = async (req, res, next) => {
  try {
    const { educationId } = req.params;

    if (!educationId || isNaN(educationId)) {
      throw new ValidationError('Invalid education ID');
    }

    const pool = req.db;

    // Get education record to verify ownership
    const [records] = await pool.query(
      'SELECT user_id FROM education WHERE id = ?',
      [educationId],
    );

    if (records.length === 0) {
      throw new NotFoundError('Education entry not found');
    }

    if (records[0].user_id !== req.user.id) {
      throw new AuthenticationError(
        'You can only delete your own education entries',
      );
    }

    await pool.query('DELETE FROM education WHERE id = ?', [educationId]);

    res.status(200).json({
      status: 'success',
      message: 'Education entry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEducation,
  addEducation,
  updateEducation,
  deleteEducation,
};
