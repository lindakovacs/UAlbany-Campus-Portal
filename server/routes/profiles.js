const express = require('express');
const { getProfile, updateProfile, listProfiles } = require('../controllers/profileController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/profiles
 * @desc    Get all profiles (paginated)
 * @access  Public
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10, max: 50)
 */
router.get('/', listProfiles);

/**
 * @route   GET /api/profiles/:userId
 * @desc    Get profile by user ID
 * @access  Public
 * @param   userId - User ID
 */
router.get('/:userId', getProfile);

/**
 * @route   PUT /api/profiles/:userId
 * @desc    Update user profile (owner only)
 * @access  Private
 * @param   userId - User ID
 * @body    bio, skills (array), social_links (object)
 */
router.put('/:userId', authMiddleware, updateProfile);

module.exports = router;
