import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { Icon, Spinner } from '../components/ui';
import { useAuth } from '../state/AuthContext';
import { isStatic } from '../lib/backend';
import { Mark } from '../site/SiteChrome';

/**
 * The founders' portal.
 *
 * Hidden from the nav for anyone who is not an admin, but that is presentation
 * only — every route behind this reads from an API that checks the role on the
 * server. Typing the URL gets you a 403, not a dashboard.
 */
const SECTIONS = [
  { to: '/admin', end: true, icon: 'dashboard', label: 'Overview', blurb: 'Traffic and enquiries at a glance' },
  { to: '/admin/traffic', icon: 'monitoring', label: 'Traffic', blurb: 'Pages, sources and devices' },
  { to: '/admin/leads', icon: 'inbox', label: 'Enquiries', blurb: 'Everyone who asked for a call' },
  { to: '/admin/content', icon: 'edit_note', label: 'Content', blurb: 'The site’s own words' },
];

export default function AdminShell() {
  const { user, status } = useAuth();

  /* A static build — GitHub Pages, or any host that serves files and nothing
     else — has no API behind it, so there is nothing here to sign in to. Say
     that, rather than sending somebody to a sign-in form that cannot succeed
     however carefully they fill it in. */
  if (isStatic) return <NeedsServer />;

  if (status === 'loading') return <Spinner label="Checking your session" />;
  if (!user) return <Navigate to="/sign-in?next=/admin" replace />;

  /* A member who reaches this URL is told plainly rather than bounced to a
     screen that looks broken. The API would refuse them regardless. */
  if (user.role !== 'admin') {
    return (
      <div className="container stack stack-md" style={{ padding: '96px 0', maxWidth: 560, alignItems: 'center', textAlign: 'center' }}>
        <Icon name="lock" size={40} style={{ color: 'var(--on-surface-variant)' }} />
        <h1 style={{ fontSize: 28 }}>This is the founders’ portal.</h1>
        <p className="muted">
          Your account does not have admin access. If it should, another admin can grant it.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-nav">
        <NavLink to="/" className="row" style={{ gap: 10, marginBottom: 26 }}>
          <Mark size={30} />
          <span className="stack" style={{ gap: 0 }}>
            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 14 }}>Akshay Vriddhi</strong>
            <span className="tiny muted">Admin</span>
          </span>
        </NavLink>

        <nav className="stack" style={{ gap: 3 }}>
          {SECTIONS.map((section) => (
            <NavLink
              key={section.to}
              to={section.to}
              end={section.end}
              className={({ isActive }) => `admin-link${isActive ? ' is-on' : ''}`}
            >
              <Icon name={section.icon} size={19} />
              <span className="stack" style={{ gap: 1 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{section.label}</span>
                <span className="tiny muted">{section.blurb}</span>
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-foot">
          <NavLink to="/" className="tiny row" style={{ gap: 6 }}>
            <Icon name="arrow_back" size={15} /> Back to the site
          </NavLink>
          <p className="tiny muted" style={{ marginTop: 10, lineHeight: 1.6 }}>
            Signed in as {user.name}.
          </p>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

/**
 * What the portal looks like on a host that cannot run it.
 *
 * The marketing site is published to GitHub Pages, which serves files and
 * nothing else. The portal needs the API — for the traffic it reads, the copy
 * it edits and the enquiries it lists — so on that build it explains itself
 * instead of pretending a sign-in form would help.
 */
function NeedsServer() {
  const steps = [
    { icon: 'dns', label: 'Run the API', detail: 'npm start — a Node process and a SQLite file' },
    { icon: 'person_add', label: 'Create an account', detail: 'Through the normal sign-up on that server' },
    { icon: 'admin_panel_settings', label: 'Grant admin', detail: 'npm --prefix server run role -- you@example.com admin' },
  ];

  return (
    <div className="container stack stack-lg" style={{ padding: '90px 0', maxWidth: 720 }}>
      <div className="stack stack-sm">
        <span className="eyebrow" style={{ color: 'var(--gold-ink)' }}>Founders’ portal</span>
        <h1 style={{ fontSize: 34 }}>This copy of the site has no server behind it.</h1>
        <p className="muted" style={{ lineHeight: 1.75 }}>
          The portal edits the site’s copy, reads its traffic and lists its enquiries — all of which
          live in a database. This build is published to a static host, which serves files and
          nothing else, so there is nothing here to sign in to.
        </p>
        <p className="muted" style={{ lineHeight: 1.75 }}>
          Everything the public site does still works: the calculators run in your browser, and the
          copy is compiled into the page rather than fetched.
        </p>
      </div>

      <div className="stack stack-sm">
        <h3>To open it</h3>
        {steps.map((step, index) => (
          <div key={step.label} className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
            <span className="medallion medallion-solid" style={{ width: 38, height: 38, flex: 'none' }}>
              <Icon name={step.icon} size={18} />
            </span>
            <span className="stack" style={{ gap: 2 }}>
              <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 15 }}>
                {index + 1}. {step.label}
              </strong>
              <code className="tiny muted" style={{ fontFamily: 'ui-monospace, monospace' }}>{step.detail}</code>
            </span>
          </div>
        ))}
      </div>

      <NavLink to="/" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }}>
        <Icon name="arrow_back" size={17} /> Back to the site
      </NavLink>
    </div>
  );
}
