import { ValidationError } from '../utils/errorHandler.js';

/**
 * Middleware factory for Zod validation
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const errorMessages = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return next(new ValidationError('Invalid input data', errorMessages));
      }
      return next(new ValidationError(err.message));
    }
  };
};
