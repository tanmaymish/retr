import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { signUp, startTestServer } from './helpers.js';

describe('authentication', () => {
  let server;
  const extra = [];
  before(async () => {
    server = await startTestServer();
  });
  after(async () => {
    await server.close();
    for (const s of extra) await s.close();
  });

  it('registers an account and returns the signed-in user', async () => {
    const { user } = await signUp(server);
    assert.equal(user.onboarded, false);
    assert.equal(user.mfaEnabled, false);
    assert.ok(user.id);
    assert.equal(user.password, undefined);
    assert.equal(user.passwordHash, undefined);
  });

  it('rejects a password shorter than the policy', async () => {
    const client = server.client();
    const response = await client.post('/api/auth/register', {
      name: 'Short',
      email: `short-${Date.now()}@example.test`,
      password: 'abc123',
    });
    assert.equal(response.status, 400);
    assert.ok(response.body.error.details.fields.password);
  });

  it('rejects a password from the breach list', async () => {
    const client = server.client();
    const response = await client.post('/api/auth/register', {
      name: 'Common',
      email: `common-${Date.now()}@example.test`,
      password: 'passwordpassword',
    });
    assert.equal(response.status, 400);
  });

  it('does not let the same address register twice', async () => {
    const { credentials } = await signUp(server);
    const response = await server.client().post('/api/auth/register', {
      name: 'Impostor',
      email: credentials.email,
      password: 'a different long password',
    });
    assert.equal(response.status, 409);
  });

  it('signs in with the right password and refuses the wrong one', async () => {
    const { credentials } = await signUp(server);

    const good = await server.client().post('/api/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });
    assert.equal(good.status, 200);
    assert.equal(good.body.mfaRequired, false);

    const bad = await server.client().post('/api/auth/login', {
      email: credentials.email,
      password: 'not the password at all',
    });
    assert.equal(bad.status, 401);
    // The same message for a wrong password and an unknown address.
    const unknown = await server.client().post('/api/auth/login', {
      email: 'nobody@example.test',
      password: 'not the password at all',
    });
    assert.equal(unknown.status, 401);
    assert.equal(unknown.body.error.message, bad.body.error.message);
  });

  it('sets an httpOnly session cookie and a readable CSRF cookie', async () => {
    const client = server.client();
    const response = await client.post(
      '/api/auth/register',
      { name: 'Cookie', email: `cookie-${Date.now()}@example.test`, password: 'a properly long password' },
      { raw: true },
    );
    const cookies = response.headers.getSetCookie();
    const session = cookies.find((c) => c.startsWith('av_session='));
    const csrf = cookies.find((c) => c.startsWith('av_csrf='));

    assert.match(session, /HttpOnly/i);
    assert.match(session, /SameSite=Lax/i);
    assert.doesNotMatch(csrf, /HttpOnly/i);
  });

  it('rejects a state-changing request without the CSRF header', async () => {
    const { client } = await signUp(server);
    client.dropCsrf();
    const response = await client.patch('/api/account/onboarding', { step: 'done' });
    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, 'forbidden');
  });

  it('rejects a forged CSRF token', async () => {
    const { client } = await signUp(server);
    const response = await client.patch(
      '/api/account/onboarding',
      { step: 'done' },
      { headers: { 'x-csrf-token': 'clearly-not-the-right-token' } },
    );
    assert.equal(response.status, 403);
  });

  it('refuses a cross-origin write even with valid cookies', async () => {
    const { client } = await signUp(server);
    const response = await client.patch(
      '/api/account/onboarding',
      { step: 'done' },
      { headers: { origin: 'https://evil.example' } },
    );
    assert.equal(response.status, 403);
  });

  it('signs out and invalidates the session', async () => {
    const { client } = await signUp(server);
    assert.equal((await client.get('/api/auth/me')).body.user !== null, true);

    await client.post('/api/auth/logout');
    const after = await client.get('/api/auth/me');
    assert.equal(after.body.user, null);

    const protectedCall = await client.get('/api/dashboard');
    assert.equal(protectedCall.status, 401);
  });

  it('locks an account after repeated failures and stops accepting the right password', async () => {
    const locked = await startTestServer({ MAX_FAILED_LOGINS: '3', LOCKOUT_MINUTES: '15' });
    extra.push(locked);
    const { credentials } = await signUp(locked);

    for (let i = 0; i < 3; i += 1) {
      const response = await locked.client().post('/api/auth/login', {
        email: credentials.email,
        password: 'wrong password entirely',
      });
      assert.equal(response.status, 401);
    }

    const afterLock = await locked.client().post('/api/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });
    assert.equal(afterLock.status, 429);
    assert.ok(afterLock.headers.get('retry-after'));
  });

  it('changes a password and signs other devices out', async () => {
    const { client, credentials } = await signUp(server);

    const second = server.client();
    await second.post('/api/auth/login', { email: credentials.email, password: credentials.password });
    assert.equal((await second.get('/api/auth/me')).body.user !== null, true);

    const changed = await client.post('/api/auth/password', {
      currentPassword: credentials.password,
      newPassword: 'an entirely different long password',
    });
    assert.equal(changed.status, 200);
    assert.equal(changed.body.otherSessionsSignedOut, 1);

    assert.equal((await second.get('/api/auth/me')).body.user, null);
    assert.equal((await client.get('/api/auth/me')).body.user !== null, true);
  });

  it('will not change a password without the current one', async () => {
    const { client } = await signUp(server);
    const response = await client.post('/api/auth/password', {
      currentPassword: 'not it',
      newPassword: 'another long enough password',
    });
    assert.equal(response.status, 401);
  });

  it('sets strict security headers on every response', async () => {
    const response = await server.client().get('/api/health', { raw: true });
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
    assert.match(response.headers.get('content-security-policy'), /object-src 'none'/);
    assert.equal(response.headers.get('x-powered-by'), null);
  });
});
