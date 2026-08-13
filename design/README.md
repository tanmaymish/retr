# Design reference

`DESIGN.md` is the Heritage Ledger design system — as it came out of the design
tool: colour roles, type scale, spacing rhythm, elevation, shape language and
component rules.

**Its palette is superseded.** The structure below — the token names, the type
scale, the spacing rhythm, the shape and elevation language — is still what the
app implements. The colours are not: every colour is now sampled from the
founders' logo (`app/public/brand/logo.png`), so the app runs on maroon, gold
and cream rather than the original Midnight Indigo on Warm Ivory. Read the
colour block below as history, and
[`app/src/styles/theme.css`](../app/src/styles/theme.css) as the truth.

The tokens live in that one file — if you change a colour or a radius, change it
there and the whole app follows.

## The brand assets

`app/public/brand/` holds the logo, cut out of the supplied artwork with its
cream background made transparent, plus the emblem on its own, the favicons and
the Open Graph card. The palette comes from that same artwork:

| Token | Colour | Where it comes from |
| --- | --- | --- |
| `--primary` | `#661426` | The crescent and the wordmark |
| `--gold` | `#b8863f` | The rising arrow and the bars |
| `--surface` | `#fbf6ec` | The ground the lockup is drawn on |

The original screen exports (one `code.html` and a `screen.png` per screen) are
not committed: they are roughly 6 MB of prototype markup that the built app
supersedes. The screens they described map onto the implementation like this:

| Design screen | Where it lives now |
| --- | --- |
| Landing page | `app/src/site/Home.jsx`, `app/src/site/About.jsx` |
| Onboarding — personalisation, categories, final state | `app/src/auth/Onboarding.jsx` |
| Vault dashboard | `app/src/app/Dashboard.jsx` |
| Smart upload — drop zone, processing, review & save | `app/src/app/Upload.jsx` |
| Share document control, sharing success | `ShareModal` in `app/src/app/DocumentDetail.jsx` |
| Family vault overview | `app/src/app/Family.jsx` |
| Designate trustee, trustee invitation, trustee acceptance | `app/src/app/Family.jsx`, `app/src/auth/InviteAccept.jsx` |
| Trustee dashboard, initiate emergency access, access waiting period, security alert | `app/src/app/Trustees.jsx` |
| Activity & audit | `app/src/app/Activity.jsx` |
| Reminders & notifications | `app/src/app/Reminders.jsx` |
| Life journey timeline | `app/src/app/Timeline.jsx` |
| Security settings | `app/src/app/Security.jsx` |

Two deliberate departures from the prototypes:

- **The trustee invitation email screen** is not an email. No mail transport is
  configured, so the invitation is a link the owner passes on, and the app says
  so rather than implying a message was sent.
- **Countdowns and states are real.** The prototype's "13d 14h 22m" is computed
  from the request's actual unlock time, and the waiting period is enforced by
  the server, not by the screen.
