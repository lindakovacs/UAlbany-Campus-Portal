const express = require('express');
const {
  getExperience,
  addExperience,
  updateExperience,
  deleteExperience,
} = require('../controllers/experienceController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/experience/:userId
 * @desc    Get user's work experience
 * @access  Public
 * @param   userId - User ID
 */
router.get('/:userId', getExperience);

/**
 * @route   POST /api/experience/:userId
 * @desc    Add work experience entry (owner only)
 * @access  Private
 * @param   userId - User ID
 * @body    company, title, location (optional), from_date, to_date (optional), current (optional), description (optional)
 */
router.post('/:userId', authMiddleware, addExperience);

/**
 * @route   PUT /api/experience/:experienceId
 * @desc    Update experience entry (owner only)
 * @access  Private
 * @param   experienceId - Experience ID
 * @body    Any field to update
 */
router.put('/:experienceId', authMiddleware, updateExperience);

/**
 * @route   DELETE /api/experience/:experienceId
 * @desc    Delete experience entry (owner only)
 * @access  Private
 * @param   experienceId - Experience ID
 */
router.delete('/:experienceId', authMiddleware, deleteExperience);

module.exports = router;
