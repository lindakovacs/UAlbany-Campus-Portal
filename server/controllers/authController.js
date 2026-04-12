const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateEmail, validatePassword, validateName } = require('../utils/validators');
const {
  ValidationError,
  AuthenticationError,
  ConflictError,
} = require('../utils/errors');

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    // Validation
    if (!validateName(name)) {
      throw new ValidationError('Name must be 2-100 characters');
    }
    if (!validateEmail(email)) {
      throw new ValidationError('Please provide a valid email');
    }
    if (!validatePassword(password)) {
      throw new ValidationError('Password must be at least 8 characters');
    }
    if (password !== passwordConfirm) {
      throw new ValidationError('Passwords do not match');
    }

    // Check if email already exists
    const [existingUsers] = await req.db.query(
      'SELECT id FROM users WHERE email = ?',
      [email],
    );
    if (existingUsers.length > 0) {
      throw new ConflictError('Email is already registered');
    }

    // Hash password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await req.db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
    );

    const userId = result.insertId;

    // Auto-create profile for new user
    await req.db.query(
      'INSERT INTO profiles (user_id) VALUES (?)',
      [userId],
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' },
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        name,
        email,
      },
    });
  } catch (err) {
    if (err instanceof ValidationError || err instanceof ConflictError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!validateEmail(email)) {
      throw new ValidationError('Please provide a valid email');
    }
    if (!password) {
      throw new ValidationError('Password is required');
    }

    // Find user by email
    const [users] = await req.db.query(
      'SELECT id, name, email, password FROM users WHERE email = ?',
      [email],
    );

    if (users.length === 0) {
      throw new AuthenticationError('Invalid email or password');
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' },
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    if (err instanceof ValidationError || err instanceof AuthenticationError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
};

// Get current user (protected)
const getCurrentUser = async (req, res) => {
  try {
    const [users] = await req.db.query(
      'SELECT id, name, email, avatar FROM users WHERE id = ?',
      [req.user.id],
    );

    if (users.length === 0) {
      throw new AuthenticationError('User not found');
    }

    res.json({
      user: users[0],
    });
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('Get current user error:', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
