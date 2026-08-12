/**
 * The only place the client talks to the server.
 *
 * Session and CSRF live in cookies, so requests carry credentials and echo the
 * CSRF cookie in a header. Nothing sensitive is kept in localStorage — a token
 * in localStorage is a token any injected script can read.
 */
const BASE = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  constructor({ status, code, message, details, requestId }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }

  /** Per-field messages from the server's validation, for inline form errors. */
  get fields() {
    return this.details?.fields ?? {};
  }
}

function readCookie(name) {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

async function request(method, path, { body, signal, raw = false } = {}) {
  const headers = {};
  let payload;

  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  if (!['GET', 'HEAD'].includes(method)) {
    const csrf = readCookie('av_csrf');
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }

  let response;
  try {
    response = await fetch(`${BASE}/api${path}`, {
      method,
      headers,
      body: payload,
      credentials: 'include',
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError({
      status: 0,
      code: 'network',
      message: 'We could not reach the vault. Check your connection and try again.',
    });
  }

  if (raw) {
    if (!response.ok) throw await toError(response);
    return response;
  }

  if (response.status === 204) return null;

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      code: data?.error?.code ?? 'error',
      message: data?.error?.message ?? 'Something went wrong.',
      details: data?.error?.details,
      requestId: data?.error?.requestId,
    });
  }

  return data;
}

async function toError(response) {
  const text = await response.text().catch(() => '');
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  return new ApiError({
    status: response.status,
    code: data?.error?.code ?? 'error',
    message: data?.error?.message ?? 'Something went wrong.',
    details: data?.error?.details,
  });
}

export const api = {
  get: (path, options) => request('GET', path, options),
  post: (path, body, options) => request('POST', path, { ...options, body }),
  patch: (path, body, options) => request('PATCH', path, { ...options, body }),
  put: (path, body, options) => request('PUT', path, { ...options, body }),
  delete: (path, body, options) => request('DELETE', path, { ...options, body }),

  /** Fetches a decrypted document as an object URL the browser can display. */
  async fileUrl(documentId, { download = false } = {}) {
    const response = await request(
      'GET',
      `/documents/${documentId}/file${download ? '?disposition=attachment' : ''}`,
      { raw: true },
    );
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },
};
