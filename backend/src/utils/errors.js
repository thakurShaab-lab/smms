export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', errors = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', errors = null) {
    super(message, 400, 'BAD_REQUEST', errors);
  }
}

export class ValidationError extends AppError {
  constructor(errors, message = 'Validation failed') {
    super(message, 422, 'VALIDATION_ERROR', errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'TOO_MANY_REQUESTS');
  }
}
