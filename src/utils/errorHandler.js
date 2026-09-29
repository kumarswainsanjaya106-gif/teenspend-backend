/**
 * Centralized Application Error Classes and Handler Middleware
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details = null) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access', details = null) {
    super(message, 401, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden access', details = null) {
    super(message, 403, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null) {
    super(message, 404, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details = null) {
    super(message, 409, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 422, details);
  }
}

/**
 * Centralized Express Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Do not expose stack traces or sensitive internal messages in production
  const response = {
    success: false,
    message,
    ...(err.details ? { error: err.details } : {})
  };

  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    response.stack = err.stack;
  }

  // Log 500 internal errors
  if (statusCode >= 500) {
    console.error(`[SERVER ERROR] ${req.method} ${req.originalUrl}:`, err);
  }

  return res.status(statusCode).json(response);
};
