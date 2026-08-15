import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { Icon, Spinner } from '../components/ui';
import { useAuth } from '../state/AuthContext';
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
            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 14 }}>Akshayvriddhi</strong>
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
