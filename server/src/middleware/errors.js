import { randomUUID } from 'node:crypto';
import { ApiError, notFound } from '../lib/errors.js';

export function notFoundHandler(req, _res, next) {
  next(notFound(`No route for ${req.method} ${req.path}.`));
}

/**
 * The single place an error becomes a response. Deliberate ApiErrors keep
 * their message; anything else becomes an opaque 500 carrying a request id
 * that matches the logged stack trace, so operators can correlate without the
 * client learning anything about internals.
 */
export function errorHandler(ctx) {
  // eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity.
  return function errorHandlerMiddleware(err, req, res, next) {
    const requestId = randomUUID();

    if (err instanceof ApiError) {
      if (err.retryAfterSeconds) res.setHeader('Retry-After', String(err.retryAfterSeconds));
      if (err.status >= 500) {
        ctx.logger.error('request_failed', { requestId, code: err.code, message: err.message });
      }
      return res.status(err.status).json({
        error: { code: err.code, message: err.message, details: err.details, requestId },
      });
    }

    // Body-parser and multer failures arrive as plain errors with a status.
    if (err?.type === 'entity.too.large' || err?.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: { code: 'payload_too_large', message: 'That file or payload is too large.', requestId },
      });
    }
    if (err?.type === 'entity.parse.failed' || err instanceof SyntaxError) {
      return res
        .status(400)
        .json({ error: { code: 'bad_request', message: 'Malformed JSON body.', requestId } });
    }
    if (err?.code === 'LIMIT_UNEXPECTED_FILE') {
      return res
        .status(400)
        .json({ error: { code: 'bad_request', message: 'Unexpected file field.', requestId } });
    }

    ctx.logger.error('unhandled_error', {
      requestId,
      method: req.method,
      path: req.path,
      message: err?.message,
      stack: err?.stack,
    });

    return res.status(500).json({
      error: { code: 'internal_error', message: 'Something went wrong on our side.', requestId },
    });
  };
}
