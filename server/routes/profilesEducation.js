const express = require('express');
const {
  ValidationError,
  NotFoundError,
  AuthenticationError,
} = require('../utils/errors');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/profiles/:userId/education
 * @desc    Get user's education history
 * @access  Public
 * @param   userId - User ID
 */
router.get('/:userId/education', async (req, res, next) => {
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
});

/**
 * @route   POST /api/profiles/education
 * @desc    Add education entry for authenticated user
 * @access  Private
 * @body    school, degree, field_of_study (optional), from_date, to_date (optional), current (optional), description (optional)
 */
router.post('/education', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    const {
      school,
      degree,
      field_of_study,
      from_date,
      to_date,
      current,
      description,
    } = req.body;

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
        user_id: userId,
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
});

/**
 * @route   DELETE /api/profiles/education/:eduId
 * @desc    Delete education entry (owner only)
 * @access  Private
 * @param   eduId - Education ID
 */
router.delete('/education/:eduId', authMiddleware, async (req, res, next) => {
  try {
    const { eduId } = req.params;
    const userId = req.user.id;

    if (!eduId || isNaN(eduId)) {
      throw new ValidationError('Invalid education ID');
    }

    const pool = req.db;

    // Check if education exists and belongs to user
    const [education] = await pool.query(
      'SELECT user_id FROM education WHERE id = ?',
      [eduId],
    );

    if (education.length === 0) {
      throw new NotFoundError('Education entry not found');
    }

    if (education[0].user_id !== userId) {
      throw new AuthenticationError(
        'You can only delete your own education entries',
      );
    }

    // Delete education
    await pool.query('DELETE FROM education WHERE id = ?', [eduId]);

    res.status(200).json({
      status: 'success',
      message: 'Education entry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
