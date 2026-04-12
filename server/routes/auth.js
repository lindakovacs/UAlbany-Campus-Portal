const express = require('express');
const { register, login, getCurrentUser } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { name, email, password, passwordConfirm }
 * @returns { token, user }
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @body    { email, password }
 * @returns { token, user }
 */
router.post('/login', login);

// Protected routes
/**
 * @route   GET /api/auth/me
 * @desc    Get current user (requires JWT)
 * @access  Private
 * @header  Authorization: Bearer <token>
 * @returns { user }
 */
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
