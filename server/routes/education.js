const express = require('express');
const {
  getEducation,
  addEducation,
  updateEducation,
  deleteEducation,
} = require('../controllers/educationController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/education/:userId
 * @desc    Get user's education history
 * @access  Public
 * @param   userId - User ID
 */
router.get('/:userId', getEducation);

/**
 * @route   POST /api/education/:userId
 * @desc    Add education entry (owner only)
 * @access  Private
 * @param   userId - User ID
 * @body    school, degree, field_of_study (optional), from_date, to_date (optional), current (optional), description (optional)
 */
router.post('/:userId', authMiddleware, addEducation);

/**
 * @route   PUT /api/education/:educationId
 * @desc    Update education entry (owner only)
 * @access  Private
 * @param   educationId - Education ID
 * @body    Any field to update
 */
router.put('/:educationId', authMiddleware, updateEducation);

/**
 * @route   DELETE /api/education/:educationId
 * @desc    Delete education entry (owner only)
 * @access  Private
 * @param   educationId - Education ID
 */
router.delete('/:educationId', authMiddleware, deleteEducation);

module.exports = router;
