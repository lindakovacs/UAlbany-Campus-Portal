const {
  ValidationError,
  NotFoundError,
  AuthenticationError,
} = require('../utils/errors');

/**
 * Get all posts (paginated)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (isNaN(page) || page < 1) {
      throw new ValidationError('Invalid page number');
    }
    if (isNaN(limit) || limit < 1 || limit > 50) {
      throw new ValidationError('Limit must be between 1 and 50');
    }

    const pool = req.db;

    // Get total count
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM posts',
    );

    // Get paginated posts with user info, like count, and comment count
    const [posts] = await pool.query(
      `SELECT p.id, p.user_id, u.name, u.email, p.text as content, p.created_at,
              COUNT(DISTINCT l.id) as like_count,
              COUNT(DISTINCT c.id) as comment_count,
              pr.profile_photo
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN likes l ON p.id = l.post_id
       LEFT JOIN comments c ON p.id = c.post_id
       LEFT JOIN profiles pr ON p.user_id = pr.user_id
       GROUP BY p.id, p.user_id, u.name, u.email, p.text, p.created_at, pr.profile_photo
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)],
    );

    // Convert counts to integers
    const formattedPosts = posts.map((post) => ({
      ...post,
      like_count: parseInt(post.like_count),
      comment_count: parseInt(post.comment_count),
    }));

    res.status(200).json({
      status: 'success',
      data: formattedPosts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get specific post by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    if (!postId || isNaN(postId)) {
      throw new ValidationError('Invalid post ID');
    }

    const pool = req.db;
    const [post] = await pool.query(
      `SELECT p.id, p.user_id, u.name, u.email, p.text as content, p.created_at,
              COUNT(DISTINCT l.id) as like_count,
              COUNT(DISTINCT c.id) as comment_count,
              pr.profile_photo
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN likes l ON p.id = l.post_id
       LEFT JOIN comments c ON p.id = c.post_id
       LEFT JOIN profiles pr ON p.user_id = pr.user_id
       WHERE p.id = ?
       GROUP BY p.id, p.user_id, u.name, u.email, p.text, p.created_at, pr.profile_photo`,
      [postId],
    );

    if (post.length === 0) {
      throw new NotFoundError('Post not found');
    }

    const postData = {
      ...post[0],
      like_count: parseInt(post[0].like_count),
      comment_count: parseInt(post[0].comment_count),
    };

    res.status(200).json({
      status: 'success',
      data: postData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new post (protected)
 * @param {Object} req - Express request object with authenticated user
 * @param {Object} res - Express response object
 */
const createPost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { content } = req.body;

    // Validate content
    if (
      !content ||
      typeof content !== 'string' ||
      content.trim().length === 0
    ) {
      throw new ValidationError('Post content is required');
    }
    if (content.trim().length > 5000) {
      throw new ValidationError('Post content cannot exceed 5000 characters');
    }

    const pool = req.db;

    // Insert post
    const [result] = await pool.query(
      'INSERT INTO posts (user_id, text) VALUES (?, ?)',
      [userId, content.trim()],
    );

    res.status(201).json({
      status: 'success',
      message: 'Post created successfully',
      data: {
        id: result.insertId,
        user_id: userId,
        content: content.trim(),
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update post (protected, owner only)
 * @param {Object} req - Express request object with authenticated user
 * @param {Object} res - Express response object
 */
const updatePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!postId || isNaN(postId)) {
      throw new ValidationError('Invalid post ID');
    }

    // Validate content
    if (
      !content ||
      typeof content !== 'string' ||
      content.trim().length === 0
    ) {
      throw new ValidationError('Post content is required');
    }
    if (content.trim().length > 5000) {
      throw new ValidationError('Post content cannot exceed 5000 characters');
    }

    const pool = req.db;

    // Check if post exists and belongs to user
    const [post] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [
      postId,
    ]);

    if (post.length === 0) {
      throw new NotFoundError('Post not found');
    }

    if (post[0].user_id !== userId) {
      throw new AuthenticationError('You can only update your own posts');
    }

    // Update post
    await pool.query('UPDATE posts SET text = ? WHERE id = ?', [
      content.trim(),
      postId,
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Post updated successfully',
      data: {
        id: parseInt(postId),
        user_id: userId,
        content: content.trim(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete post (protected, owner only)
 * @param {Object} req - Express request object with authenticated user
 * @param {Object} res - Express response object
 */
const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    if (!postId || isNaN(postId)) {
      throw new ValidationError('Invalid post ID');
    }

    const pool = req.db;

    // Check if post exists and belongs to user
    const [post] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [
      postId,
    ]);

    if (post.length === 0) {
      throw new NotFoundError('Post not found');
    }

    if (post[0].user_id !== userId) {
      throw new AuthenticationError('You can only delete your own posts');
    }

    // Delete post (cascade will delete likes and comments)
    await pool.query('DELETE FROM posts WHERE id = ?', [postId]);

    res.status(200).json({
      status: 'success',
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
};
