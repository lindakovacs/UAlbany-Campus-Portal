const {
  ValidationError,
  NotFoundError,
  AuthenticationError,
} = require('../utils/errors');

/**
 * Toggle like on a post (like if not liked, unlike if already liked)
 * @param {Object} req - Express request object with authenticated user
 * @param {Object} res - Express response object
 */
const toggleLike = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

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

    // Check if user already liked this post
    const [existingLike] = await pool.query(
      'SELECT id FROM likes WHERE user_id = ? AND post_id = ?',
      [userId, postId],
    );

    let liked = false;

    if (existingLike.length > 0) {
      // Unlike: delete the like
      await pool.query('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [
        userId,
        postId,
      ]);
      liked = false;
    } else {
      // Like: insert new like
      await pool.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [
        userId,
        postId,
      ]);
      liked = true;
    }

    res.status(200).json({
      status: 'success',
      message: liked ? 'Post liked' : 'Post unliked',
      data: {
        post_id: parseInt(postId),
        user_id: userId,
        liked,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get like count for a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLikeCount = async (req, res, next) => {
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

    // Get like count
    const [[{ count }]] = await pool.query(
      'SELECT COUNT(*) as count FROM likes WHERE post_id = ?',
      [postId],
    );

    res.status(200).json({
      status: 'success',
      data: {
        post_id: parseInt(postId),
        like_count: parseInt(count),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get list of users who liked a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLikesList = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { limit = 10 } = req.query;

    if (!postId || isNaN(postId)) {
      throw new ValidationError('Invalid post ID');
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

    // Get users who liked this post
    const [likes] = await pool.query(
      `SELECT u.id, u.name, u.email, l.created_at
       FROM likes l
       JOIN users u ON l.user_id = u.id
       WHERE l.post_id = ?
       ORDER BY l.created_at DESC
       LIMIT ?`,
      [postId, parseInt(limit)],
    );

    res.status(200).json({
      status: 'success',
      data: likes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if current user liked a post
 * @param {Object} req - Express request object with authenticated user (optional)
 * @param {Object} res - Express response object
 */
const checkIfLiked = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!postId || isNaN(postId)) {
      throw new ValidationError('Invalid post ID');
    }

    // If not authenticated, return false
    if (!userId) {
      return res.status(200).json({
        status: 'success',
        data: {
          post_id: parseInt(postId),
          liked: false,
        },
      });
    }

    const pool = req.db;

    // Check if user liked this post
    const [like] = await pool.query(
      'SELECT id FROM likes WHERE user_id = ? AND post_id = ?',
      [userId, postId],
    );

    res.status(200).json({
      status: 'success',
      data: {
        post_id: parseInt(postId),
        liked: like.length > 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleLike,
  getLikeCount,
  getLikesList,
  checkIfLiked,
};
