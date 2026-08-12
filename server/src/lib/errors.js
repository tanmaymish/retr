/**
 * Every failure the API reports deliberately is an ApiError. Anything else
 * reaching the error handler is a bug, and is reported as an opaque 500 with
 * a correlation id so internals never leak to the client.
 */
export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.expose = true;
  }
}

export const badRequest = (message, details) => new ApiError(400, 'bad_request', message, details);
export const unauthorized = (message = 'Sign in to continue.') =>
  new ApiError(401, 'unauthorized', message);
export const forbidden = (message = 'You do not have access to this resource.') =>
  new ApiError(403, 'forbidden', message);
export const notFound = (message = 'Not found.') => new ApiError(404, 'not_found', message);
export const conflict = (message, details) => new ApiError(409, 'conflict', message, details);
export const payloadTooLarge = (message) => new ApiError(413, 'payload_too_large', message);
export const unsupportedMediaType = (message) =>
  new ApiError(415, 'unsupported_media_type', message);
export const tooManyRequests = (message, retryAfterSeconds) => {
  const err = new ApiError(429, 'too_many_requests', message);
  err.retryAfterSeconds = retryAfterSeconds;
  return err;
};
export const serviceUnavailable = (message) => new ApiError(503, 'service_unavailable', message);
