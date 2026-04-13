const express = require('express');
const {
  getPostComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
  getCommentCount,
} = require('../controllers/commentController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

/**
 * @route   GET /api/posts/:postId/comments
 * @desc    Get all comments for a post (paginated)
 * @access  Public
 * @param   postId - Post ID
 * @query   page - Page number (default: 1)
 * @query   limit - Comments per page (default: 20, max: 100)
 */
router.get('/:postId/comments', getPostComments);

/**
 * @route   GET /api/comments/:commentId
 * @desc    Get a specific comment by ID
 * @access  Public
 * @param   commentId - Comment ID
 */
router.get('/:commentId', getComment);

/**
 * @route   POST /api/posts/:postId/comments
 * @desc    Create a new comment on a post
 * @access  Private
 * @param   postId - Post ID
 * @body    content - Comment content (max 1000 characters)
 */
router.post('/:postId/comments', authMiddleware, createComment);

/**
 * @route   PUT /api/comments/:commentId
 * @desc    Update a comment (owner only)
 * @access  Private
 * @param   commentId - Comment ID
 * @body    content - Updated comment content (max 1000 characters)
 */
router.put('/:commentId', authMiddleware, updateComment);

/**
 * @route   DELETE /api/comments/:commentId
 * @desc    Delete a comment (owner only)
 * @access  Private
 * @param   commentId - Comment ID
 */
router.delete('/:commentId', authMiddleware, deleteComment);

/**
 * @route   GET /api/posts/:postId/comments/count
 * @desc    Get comment count for a post
 * @access  Public
 * @param   postId - Post ID
 */
router.get('/:postId/comments/count', getCommentCount);

module.exports = router;
