const express = require('express');
const {
  ValidationError,
  NotFoundError,
  AuthenticationError,
} = require('../utils/errors');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/profiles/:userId/experience
 * @desc    Get user's work experience
 * @access  Public
 * @param   userId - User ID
 */
router.get('/:userId/experience', async (req, res, next) => {
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
});

/**
 * @route   POST /api/profiles/experience
 * @desc    Add experience entry for authenticated user
 * @access  Private
 * @body    company, title, location, from_date, to_date (optional), current (optional), description (optional)
 */
router.post('/experience', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    const {
      company,
      title,
      location,
      from_date,
      to_date,
      current,
      description,
    } = req.body;

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
        user_id: userId,
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
});

/**
 * @route   DELETE /api/profiles/experience/:expId
 * @desc    Delete experience entry (owner only)
 * @access  Private
 * @param   expId - Experience ID
 */
router.delete('/experience/:expId', authMiddleware, async (req, res, next) => {
  try {
    const { expId } = req.params;
    const userId = req.user.id;

    if (!expId || isNaN(expId)) {
      throw new ValidationError('Invalid experience ID');
    }

    const pool = req.db;

    // Check if experience exists and belongs to user
    const [experience] = await pool.query(
      'SELECT user_id FROM experience WHERE id = ?',
      [expId],
    );

    if (experience.length === 0) {
      throw new NotFoundError('Experience entry not found');
    }

    if (experience[0].user_id !== userId) {
      throw new AuthenticationError(
        'You can only delete your own experience entries',
      );
    }

    // Delete experience
    await pool.query('DELETE FROM experience WHERE id = ?', [expId]);

    res.status(200).json({
      status: 'success',
      message: 'Experience entry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
