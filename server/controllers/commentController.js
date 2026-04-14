const {
  ValidationError,
  NotFoundError,
  AuthenticationError,
} = require('../utils/errors');

/**
 * Get all comments for a post (paginated)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPostComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!postId || isNaN(postId)) {
      throw new ValidationError('Invalid post ID');
    }

    if (isNaN(page) || page < 1) {
      throw new ValidationError('Page must be a positive integer');
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    const pool = req.db;

    // Check if post exists
    const [post] = await pool.query('SELECT id FROM posts WHERE id = ?', [
      postId,
    ]);

    if (post.length === 0) {
      throw new NotFoundError('Post not found');
    }

    const offset = (page - 1) * limit;

    // Get total comment count
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM comments WHERE post_id = ?',
      [postId],
    );

    // Get comments with user info
    const [comments] = await pool.query(
      `SELECT c.id, c.post_id, c.user_id, u.name, u.email, c.text as content, c.created_at, pr.profile_photo
       FROM comments c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN profiles pr ON c.user_id = pr.user_id
       WHERE c.post_id = ?
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [postId, parseInt(limit), offset],
    );

    const pages = Math.ceil(total / limit);

    res.status(200).json({
      status: 'success',
      data: comments,
      pagination: {
        total: parseInt(total),
        page: parseInt(page),
        limit: parseInt(limit),
        pages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific comment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    if (!commentId || isNaN(commentId)) {
      throw new ValidationError('Invalid comment ID');
    }

    const pool = req.db;

    const [comments] = await pool.query(
      `SELECT c.id, c.post_id, c.user_id, u.name, u.email, c.text as content, c.created_at
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [commentId],
    );

    if (comments.length === 0) {
      throw new NotFoundError('Comment not found');
    }

    res.status(200).json({
      status: 'success',
      data: comments[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new comment on a post
 * @param {Object} req - Express request object with authenticated user
 * @param {Object} res - Express response object
 */
const createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Validation
    if (!postId || isNaN(postId)) {
      throw new ValidationError('Invalid post ID');
    }

    if (!content || typeof content !== 'string') {
      throw new ValidationError('Comment content is required');
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length === 0) {
      throw new ValidationError('Comment content cannot be empty');
    }

    if (trimmedContent.length > 1000) {
      throw new ValidationError(
        'Comment content cannot exceed 1000 characters',
      );
    }

    const pool = req.db;

    // Check if post exists
    const [post] = await pool.query('SELECT id FROM posts WHERE id = ?', [
      postId,
    ]);

    if (post.length === 0) {
      throw new NotFoundError('Post not found');
    }

    // Create comment
    const [result] = await pool.query(
      'INSERT INTO comments (user_id, post_id, text) VALUES (?, ?, ?)',
      [userId, postId, trimmedContent],
    );

    // Get the created comment with user info and profile photo
    const [comments] = await pool.query(
      `SELECT c.id, c.post_id, c.user_id, u.name, u.email, c.text as content, c.created_at, pr.profile_photo
       FROM comments c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN profiles pr ON c.user_id = pr.user_id
       WHERE c.id = ?`,
      [result.insertId],
    );

    res.status(201).json({
      status: 'success',
      message: 'Comment added successfully',
      data: comments[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a comment (owner only)
 * @param {Object} req - Express request object with authenticated user
 * @param {Object} res - Express response object
 */
const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Validation
    if (!commentId || isNaN(commentId)) {
      throw new ValidationError('Invalid comment ID');
    }

    if (!content || typeof content !== 'string') {
      throw new ValidationError('Comment content is required');
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length === 0) {
      throw new ValidationError('Comment content cannot be empty');
    }

    if (trimmedContent.length > 1000) {
      throw new ValidationError(
        'Comment content cannot exceed 1000 characters',
      );
    }

    const pool = req.db;

    // Check if comment exists and verify ownership
    const [comments] = await pool.query(
      'SELECT user_id FROM comments WHERE id = ?',
      [commentId],
    );

    if (comments.length === 0) {
      throw new NotFoundError('Comment not found');
    }

    if (comments[0].user_id !== userId) {
      throw new AuthenticationError('You can only update your own comments');
    }

    // Update comment
    await pool.query('UPDATE comments SET text = ? WHERE id = ?', [
      trimmedContent,
      commentId,
    ]);

    // Get updated comment with user info
    const [updatedComment] = await pool.query(
      `SELECT c.id, c.post_id, c.user_id, u.name, u.email, c.text as content, c.created_at
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [commentId],
    );

    res.status(200).json({
      status: 'success',
      message: 'Comment updated successfully',
      data: updatedComment[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a comment (owner only)
 * @param {Object} req - Express request object with authenticated user
 * @param {Object} res - Express response object
 */
const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Validation
    if (!commentId || isNaN(commentId)) {
      throw new ValidationError('Invalid comment ID');
    }

    const pool = req.db;

    // Check if comment exists and verify ownership
    const [comments] = await pool.query(
      'SELECT user_id FROM comments WHERE id = ?',
      [commentId],
    );

    if (comments.length === 0) {
      throw new NotFoundError('Comment not found');
    }

    if (comments[0].user_id !== userId) {
      throw new AuthenticationError('You can only delete your own comments');
    }

    // Delete comment
    await pool.query('DELETE FROM comments WHERE id = ?', [commentId]);

    res.status(200).json({
      status: 'success',
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comment count for a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCommentCount = async (req, res, next) => {
  try {
    const { postId } = req.params;

    if (!postId || isNaN(postId)) {
      throw new ValidationError('Invalid post ID');
    }

    const pool = req.db;

    // Check if post exists
    const [post] = await pool.query('SELECT id FROM posts WHERE id = ?', [
      postId,
    ]);

    if (post.length === 0) {
      throw new NotFoundError('Post not found');
    }

    // Get comment count
    const [[{ count }]] = await pool.query(
      'SELECT COUNT(*) as count FROM comments WHERE post_id = ?',
      [postId],
    );

    res.status(200).json({
      status: 'success',
      data: {
        post_id: parseInt(postId),
        comment_count: parseInt(count),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPostComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
  getCommentCount,
};
