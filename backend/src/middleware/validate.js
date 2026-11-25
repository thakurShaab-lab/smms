import { ZodError } from 'zod';
import { ValidationError } from '../utils/errors.js';

export function validate(schema) {
  return function validateMiddleware(req, res, next) {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message
        }));
        next(new ValidationError(errors));
        return;
      }
      next(error);
    }
  };
}
