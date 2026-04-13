const express = require('express');
const {
  toggleLike,
  getLikeCount,
  getLikesList,
  checkIfLiked,
} = require('../controllers/likeController');
const { authMiddleware } = require('../middleware/auth');
const { optionalAuthMiddleware } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

/**
 * @route   POST /api/posts/:postId/like
 * @desc    Toggle like on post (protected, authenticated user)
 * @access  Private
 * @param   postId - Post ID
 */
router.post('/:postId/like', authMiddleware, toggleLike);

/**
 * @route   GET /api/posts/:postId/likes/count
 * @desc    Get like count for a post
 * @access  Public
 * @param   postId - Post ID
 */
router.get('/:postId/likes/count', getLikeCount);

/**
 * @route   GET /api/posts/:postId/likes
 * @desc    Get list of users who liked a post
 * @access  Public
 * @param   postId - Post ID
 * @query   limit - Max users to return (default: 10, max: 100)
 */
router.get('/:postId/likes', getLikesList);

/**
 * @route   GET /api/posts/:postId/likes/check
 * @desc    Check if current user liked a post
 * @access  Private (optional auth)
 * @param   postId - Post ID
 */
router.get('/:postId/likes/check', optionalAuthMiddleware, checkIfLiked);

module.exports = router;
