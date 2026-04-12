// Custom error class for API errors
class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

// Validation error
class ValidationError extends ApiError {
  constructor(message, statusCode = 400) {
    super(message, statusCode);
    this.name = 'ValidationError';
  }
}

// Authentication error
class AuthenticationError extends ApiError {
  constructor(message = 'Unauthorized', statusCode = 401) {
    super(message, statusCode);
    this.name = 'AuthenticationError';
  }
}

// Not found error
class NotFoundError extends ApiError {
  constructor(message = 'Resource not found', statusCode = 404) {
    super(message, statusCode);
    this.name = 'NotFoundError';
  }
}

// Conflict error (e.g., user already exists)
class ConflictError extends ApiError {
  constructor(message = 'Resource already exists', statusCode = 409) {
    super(message, statusCode);
    this.name = 'ConflictError';
  }
}

module.exports = {
  ApiError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
};
