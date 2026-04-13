const express = require('express');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/posts
 * @desc    Get all posts (paginated)
 * @access  Public
 * @query   page (default: 1), limit (default: 10, max: 50)
 */
router.get('/', getPosts);

/**
 * @route   POST /api/posts
 * @desc    Create new post (owner only)
 * @access  Private
 * @body    content (required, max 5000 chars)
 */
router.post('/', authMiddleware, createPost);

/**
 * @route   GET /api/posts/:postId
 * @desc    Get specific post by ID
 * @access  Public
 * @param   postId - Post ID
 */
router.get('/:postId', getPost);

/**
 * @route   PUT /api/posts/:postId
 * @desc    Update post (owner only)
 * @access  Private
 * @param   postId - Post ID
 * @body    content (required, max 5000 chars)
 */
router.put('/:postId', authMiddleware, updatePost);

/**
 * @route   DELETE /api/posts/:postId
 * @desc    Delete post (owner only)
 * @access  Private
 * @param   postId - Post ID
 */
router.delete('/:postId', authMiddleware, deletePost);

module.exports = router;
