import { badRequest } from '../lib/errors.js';

/**
 * Validates and *replaces* the request payload with the parsed result, so
 * handlers only ever see data that passed a schema. Unknown keys are stripped
 * by the schemas themselves (zod objects are strip-by-default), which stops
 * mass-assignment of columns a client should not control.
 */
export function validateBody(schema) {
  return function validateBodyMiddleware(req, _res, next) {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) return next(badRequest('Check the highlighted fields.', fieldErrors(result)));
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return function validateQueryMiddleware(req, _res, next) {
    const result = schema.safeParse(req.query ?? {});
    if (!result.success) return next(badRequest('Invalid query parameters.', fieldErrors(result)));
    // req.query is a getter-only property in Express 5.
    Object.defineProperty(req, 'validatedQuery', { value: result.data, configurable: true });
    next();
  };
}

function fieldErrors(result) {
  const fields = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || '_';
    if (!fields[key]) fields[key] = issue.message;
  }
  return { fields };
}
