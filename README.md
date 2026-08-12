# Heritage Ledger

A secure family digital vault. Keep the documents a family actually goes looking
for — policies, deeds, IDs, wills — encrypted, organised, and reachable by the
right people at the right time.

It is a full application, not a prototype: a Node API with a SQLite database, a
React client, real authentication, per-document encryption, family sharing,
trustees, and a time-locked emergency access protocol. Every number and state
the interface shows is computed from stored data on request.

```
┌──────────────┐        same origin        ┌───────────────────────────────┐
│  React SPA   │ ────────────────────────► │  Express API                  │
│  (app/)      │   httpOnly cookie + CSRF  │  (server/)                    │
└──────────────┘                           │   ├── auth, sessions, MFA     │
                                           │   ├── documents (AES-256-GCM) │
                                           │   ├── sharing + trustees      │
                                           │   ├── emergency protocol      │
                                           │   └── engine (derived state)  │
                                           └──────────┬────────────────────┘
                                                      │
                                       SQLite (WAL) + encrypted files on disk
```

## Running it

```bash
npm install            # installs both workspaces
npm run dev            # API on :4000, client on :5173
```

Open http://localhost:5173. In development the secrets are generated per start,
so restarting signs everyone out and makes previously stored documents
unreadable — which is what you want locally and never in production.

```bash
npm test               # server test suite
npm run check          # lint + tests + production build
npm run build && npm start   # production mode: the API serves the built client
```

### Production

```bash
cp server/.env.example server/.env       # then fill in the two secrets
docker build -t heritage-ledger .
docker run -p 4000:4000 -v heritage-data:/data \
  -e SESSION_SECRET="$(openssl rand -base64 48)" \
  -e DOCUMENT_KEY="$(openssl rand -base64 48)" \
  heritage-ledger
```

`DOCUMENT_KEY` is the master key every document key is derived from. **Losing it
means losing every document** — the ciphertext cannot be recovered without it.
The server refuses to start in production without both secrets, and refuses to
start with insecure cookies.

## What it does

**The vault.** Upload a PDF or an image and it is encrypted before it reaches
disk. The server reads the file's text layer itself — no third-party service —
and pulls out dates, providers and reference numbers, each returned with the
evidence it came from and a confidence. Nothing is saved until you have reviewed
it, and a scan with no text layer says so rather than guessing.

**Reminders** are derived from the dates on your documents on every read, never
stored. Correct a renewal date and its reminder corrects itself; delete a
document and its reminder cannot outlive it. Lead times match what the deadline
costs — six months for a passport, six weeks for a policy.

**Readiness** scores how much of what a family would need is actually present and
reachable, and says what would move it most. It is a measure of the vault, not a
grade of the person.

**Sharing** works per document or per whole category. Access is resolved fresh on
every read from ownership, grants and shares, so revocation takes effect on the
next click rather than the next login.

**Trustees** hold a key to a procedure, not to your vault. A trustee sees nothing
until they start the emergency protocol — and then a waiting period runs
(fourteen days by default) during which you are notified and can deny it. Three
things make that safe rather than merely slow:

- a trustee cannot request anything for the first fourteen days after accepting,
  so a stolen invitation cannot be used the day it is taken;
- the waiting period is copied onto the request when it starts, so changing the
  setting later cannot shorten a countdown already running;
- when access does open it is limited to the categories that trustee was
  designated for, expires after thirty days, and every document they open is
  written to your activity log with their name on it.

## Security

| Concern | How it is handled |
| --- | --- |
| Passwords | scrypt (N=32768, r=8, p=1) with a per-password salt; self-describing hashes so parameters can be raised later |
| Sessions | Opaque 256-bit tokens stored as HMACs — revocable server-side, unlike a JWT. Idle **and** absolute expiry, rotated on login |
| Cookies | httpOnly, SameSite, Secure in production; the CSRF cookie is deliberately readable and useless without the session cookie |
| CSRF | Double-submit token bound to the session's stored HMAC, plus an Origin check on every write |
| MFA | RFC 6238 TOTP implemented on `node:crypto`; a session that has passed the password step can do nothing but complete the challenge |
| Documents at rest | AES-256-GCM, a per-document key derived via HKDF, with owner + document id as additional authenticated data — a row moved between accounts fails to decrypt |
| Uploads | Allow-list of types, byte-signature check against the declared type, size cap, and a per-vault document limit |
| Authorisation | Resolved per request from ownership, grants, shares and emergency state. A document you cannot see returns 404, not 403 |
| Brute force | Per-IP and per-account rate limits, plus account lockout |
| Headers | Strict CSP with a per-response nonce, `frame-ancestors 'none'`, nosniff, HSTS in production |
| Errors | Deliberate failures carry a message; anything else is an opaque 500 with a request id matching the logged stack |

Run the tests to see these exercised: cross-user isolation, CSRF rejection,
cookie flags, upload spoofing, lockout, and the full trustee protocol are all
covered.

## Layout

```
app/                 React client (Vite)
  src/site/          Marketing site — landing page, founder profiles
  src/auth/          Sign in, sign up, MFA, onboarding, invitation acceptance
  src/app/           The vault itself
server/
  src/engine/        Pure functions: readiness, reminders, timeline, extraction
  src/routes/        HTTP surface
  src/services/      Sessions, vault storage, access resolution, notifications
  src/middleware/    Security headers, CSRF, rate limiting, auth, validation
  test/              Integration tests against a real server on an ephemeral port
```

## Two things this deployment does not do

Both are stated in the interface rather than hidden:

- **No email or SMS is sent.** Invitations produce a link you pass on yourself,
  and emergency notifications are recorded rather than delivered. Wiring a
  transport means implementing `deliver` in `server/src/services/notifications.js`
  and nothing else changes.
- **Founder profiles are placeholders.** `app/src/site/content.js` carries the two
  founders' real names and LinkedIn links; their biographies, experience and
  photographs are empty scaffolding to be filled in from what they actually
  provide. Drop headshots at `app/public/founders/<id>.jpg` and set
  `placeholder: false`.
