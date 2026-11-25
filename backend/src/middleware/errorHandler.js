import { MulterError } from 'multer';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function notFoundHandler(req, res) {
  return sendError(res, { statusCode: 404, message: `Route not found: ${req.method} ${req.originalUrl}`, code: 'ROUTE_NOT_FOUND' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  if (error instanceof AppError) {
    return sendError(res, {
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
      errors: error.errors
    });
  }

  if (error instanceof MulterError) {
    return sendError(res, { statusCode: 400, message: `Upload error: ${error.message}`, code: 'UPLOAD_ERROR' });
  }

  if (error?.code === 'ER_DUP_ENTRY') {
    return sendError(res, { statusCode: 409, message: 'A record with these details already exists', code: 'CONFLICT' });
  }

  logger.error('Unhandled error', {
    message: error.message,
    stack: env.isProduction ? undefined : error.stack
  });

  return sendError(res, {
    statusCode: 500,
    message: env.isProduction ? 'Internal server error' : error.message,
    code: 'INTERNAL_ERROR'
  });
}
