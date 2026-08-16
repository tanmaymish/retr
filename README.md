# Akshay Vriddhi

**Prosperity with Purpose.** A financial-protection institution and the secure
family vault behind it: the documents a family actually goes looking for —
policies, deeds, IDs, wills — encrypted, organised, and reachable by the right
people at the right time.

The marketing site carries the brand narrative (philosophy, founders, vision and
mission); the vault is the product it introduces.

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

The suite above never opens a browser, and there is a class of failure it
cannot see: a control that renders correctly, is not disabled, and does nothing
when clicked. That shipped once — every "Request a call" button on every page
was dead in the published build, and every check passed. So there is one test
that clicks:

```bash
npx --prefix app playwright install chromium              # once
VITE_STATIC=true npm run build && npm --prefix app run smoke
```

It drives `app/dist` — what is about to be published, not what the dev server
happens to do. Two pages get their contents from the API rather than from the
bundle, so on a build made for the server (`npm run build` with no
`VITE_STATIC`) run it as `SMOKE_SERVED=1 npm --prefix app run smoke` and those
two are reported as skipped instead of failing on a server that is not up.

It asserts on behaviour rather than on files: the pages render, the
call-to-action opens the dialog, a calculator produces a figure, the portal
route resolves, and nothing throws. Pass `VITE_BASE` to match the path the site
will be published under. It runs on every publish, before the deploy.

### Production

```bash
cp server/.env.example server/.env       # then fill in the two secrets
docker build -t akshayvriddhi .
docker run -p 4000:4000 -v akshayvriddhi-data:/data \
  -e SESSION_SECRET="$(openssl rand -base64 48)" \
  -e DOCUMENT_KEY="$(openssl rand -base64 48)" \
  akshayvriddhi
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
  src/site/          Marketing site — home, about, founders, brand copy
  src/auth/          Sign in, sign up, MFA, onboarding, invitation acceptance
  src/app/           The vault itself
shared/              Pure logic both sides import — the preparedness scoring
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
- **The name-to-face mapping on the founder photographs is unverified.** The two
  supplied headshots carried no identifying metadata, so which name sits under
  which portrait is an assumption. If it is the wrong way round, swap the two
  `photo` values in `app/src/site/content.js` — nothing else needs changing.

- **The logo spells the name `Akshay Vridhi`; the site spells it
  `Akshay Vriddhi`.** Both appear on the page — the lockup in the footer, the
  text everywhere else — so one of them is wrong and only the founders can say
  which. The text spelling is a single string: `brand.name` in
  `app/src/site/content.js`. The `IMF` line in the lockup is likewise carried as
  artwork only; no IRDAI registration number is claimed anywhere, and none
  should be added without the certificate to back it.

Photographs live in `app/public/images` (scene) and `app/public/founders`
(portraits), each as WebP with a JPEG fallback and a smaller variant for narrow
screens. They were optimised once and committed; no image tooling runs at build
time.

## Publishing the portfolio site on its own

The marketing site can be published without the API at all — GitHub Pages, or
any host that serves files. `.github/workflows/pages.yml` does it on every push
to `main`, and asks GitHub to enable Pages itself, so there is nothing to click
in Settings. It is the only workflow that deploys — a second one used to, and
the two raced for the same deployment on every push.

A static build sets `VITE_STATIC=true`, and two things change:

- **The preparedness check scores in the browser.** Its scoring is a pure
  function in [`shared/preparedness.js`](shared/preparedness.js), imported by
  the server and, in a static build, by the client. The same file, not a copy,
  so the two can never drift apart.
- **Enquiries need somewhere to go.** Set the repository variable
  `LEADS_ENDPOINT` (Settings → Secrets and variables → Actions → Variables) to a
  URL that accepts a JSON `POST` — a form service, or the firm's own API — and
  the callback popup and contact form post to it. **With nothing configured the
  forms say plainly that they are not connected**, and the popup does not appear
  at all: a form that silently drops what someone typed is worse than no form.

The doors into the vault (`Sign in`, `Create your vault`) are left out of a
static build rather than left broken, and `404.html` boots the same app so a
deep link still resolves.

Run it locally the same way:

```
VITE_STATIC=true npm run build && npx serve app/dist
```

## Deploying the server

The marketing site is happy on a static host. The founders' portal is not: it
edits copy, reads traffic and lists enquiries, and all three are database
queries. That half needs a process, a disk that survives a deploy, and one
origin.

[`fly.toml`](fly.toml) sets that up. Fly because SQLite wants a real volume and
Mumbai is a region — the households this serves are in India, and a round trip
to Virginia is a quarter of a second nobody needs to spend.

```
fly launch --no-deploy --copy-config
fly volumes create data --size 1 --region bom
fly secrets set \
  SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))") \
  DOCUMENT_KEY=$(node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))")
fly deploy
```

Both secrets are mandatory and the server refuses to start without them. That
is deliberate: a default signing key is not a default, it is a vulnerability.

Then create an account through the normal sign-up and grant it admin — there is
no self-service path, so no request however crafted can grant it:

```
fly ssh console -C "node server/scripts/set-role.mjs you@example.com admin"
```

The portal is then at `https://<your-app>.fly.dev/admin`, same-origin with its
API, which is why its session cookie is an ordinary first-party cookie rather
than a cross-site one that modern browsers increasingly refuse.

The image is the same [`Dockerfile`](Dockerfile) either way, so Render, Railway,
Coolify or a plain VPS work identically — they need the same two secrets, a
volume mounted at `/data`, and `TRUST_PROXY=true` if anything terminates TLS in
front of the app. Without that last one every visitor shares a single
rate-limit bucket and a single visitor hash.

### Connecting the published site to it

Set one repository variable and the two halves join up:

| Variable | Effect |
| --- | --- |
| `API_URL` | `https://<your-app>.fly.dev`. The published site starts reporting page views to the portal and picks up any copy edited there. |
| `LEADS_ENDPOINT` | Where an enquiry is posted. |

Neither is required. With `API_URL` unset the collector is off and the site uses
the copy compiled into its own bundle — it is complete either way, which is the
point: **the marketing site never depends on the server being up.** The server's
`CORS_ORIGINS` must name the Pages origin for the two public endpoints, which
[`fly.toml`](fly.toml) already does.

## The brand

The palette is not a taste decision — every colour is sampled from the founders'
logo, which lives in `app/public/brand`:

| | |
| --- | --- |
| Maroon `#661426` | The crescent and the wordmark. Actions, links, identity |
| Gold `#b8863f` | The rising arrow and the bars. Accents, rules, anything asking for attention |
| Cream `#fbf6ec` | The ground the lockup is drawn on. Every surface steps down from it |

The supplied artwork had that cream painted in as a background; it was cut out
so the logo composites onto any surface, and the emblem was separated from the
lockup for use at small sizes and as the favicon. The lockup sets the name in
wide serif capitals, so Cinzel carries the wordmark while Manrope and Plus
Jakarta Sans carry the rest.

There is a dark counterpart, and it is not an inversion. A maroon brand has
nowhere to go on a neutral black — it reads as any other dark site — so the
ground becomes deep wine, the crescent's own colour taken down rather than a
grey taken up, and the gold leads the way it leads in the logo. Both themes are
defined only as tokens: no component reaches for a colour that works in one and
fails in the other.
