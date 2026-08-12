import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Badge, Icon } from '../components/ui';
import { Mark } from '../site/Landing';
import { useAuth } from '../state/AuthContext';
import { useApi } from '../lib/useApi';
import { api } from '../lib/api';
import { initials, relativeTime } from '../lib/format';
import './shell.css';

const PRIMARY = [
  { to: '/vault', label: 'Overview', icon: 'dashboard', end: true },
  { to: '/vault/documents', label: 'Documents', icon: 'folder' },
  { to: '/vault/reminders', label: 'Reminders', icon: 'notifications' },
  { to: '/vault/timeline', label: 'Life journey', icon: 'history_edu' },
];

const PEOPLE = [
  { to: '/vault/family', label: 'Family', icon: 'family_restroom' },
  { to: '/vault/trustees', label: 'Trustees', icon: 'gavel' },
  { to: '/vault/shared', label: 'Shared with me', icon: 'folder_shared' },
];

const ACCOUNT = [
  { to: '/vault/activity', label: 'Activity log', icon: 'history' },
  { to: '/vault/security', label: 'Security', icon: 'shield' },
];

export default function AppShell() {
  const { user } = useAuth();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const { data: shared } = useApi('/shared-with-me');

  useEffect(() => setNavOpen(false), [location.pathname]);

  const pendingInvites = shared?.pendingInvites?.length ?? 0;

  return (
    <div className="shell">
      <aside className={`shell-nav${navOpen ? ' open' : ''}`}>
        <Link to="/vault" className="row" style={{ gap: 10, color: 'inherit', padding: '4px 8px 20px' }}>
          <Mark size={38} />
          <span className="stack" style={{ gap: 0 }}>
            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>Heritage Ledger</strong>
            <span className="tiny muted">Family Vault</span>
          </span>
        </Link>

        <nav className="stack" style={{ gap: 2 }} aria-label="Vault sections">
          {PRIMARY.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
          <span className="nav-group">People</span>
          {PEOPLE.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              badge={item.to === '/vault/shared' && pendingInvites ? pendingInvites : null}
            />
          ))}
          <span className="nav-group">Account</span>
          {ACCOUNT.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        <div className="grow" />
        <Link to="/vault/add" className="btn" style={{ width: '100%' }}>
          <Icon name="add" size={20} />
          Secure new asset
        </Link>
      </aside>

      <div className="shell-main">
        <TopBar onMenu={() => setNavOpen((v) => !v)} navOpen={navOpen} user={user} />
        <main className="shell-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, label, icon, end, badge }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
      <Icon name={icon} size={20} />
      <span className="grow">{label}</span>
      {badge ? <span className="nav-badge">{badge}</span> : null}
    </NavLink>
  );
}

function TopBar({ onMenu, navOpen, user }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const { data, reload } = useApi('/account/notifications');

  const notifications = data?.notifications ?? [];
  const unread = notifications.filter((n) => !n.readAt).length;

  async function markAllRead() {
    await api.post('/account/notifications/read-all');
    reload();
  }

  function onSearch(event) {
    event.preventDefault();
    navigate(`/vault/documents?search=${encodeURIComponent(query)}`);
  }

  return (
    <header className="shell-top">
      <button className="btn btn-ghost show-mobile" onClick={onMenu} aria-label="Menu" aria-expanded={navOpen}>
        <Icon name={navOpen ? 'close' : 'menu'} />
      </button>

      <form onSubmit={onSearch} className="shell-search" role="search">
        <Icon name="search" size={20} style={{ color: 'var(--on-surface-variant)' }} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search family documents…"
          aria-label="Search documents"
        />
      </form>

      <div className="row" style={{ gap: 4, position: 'relative' }}>
        <button
          className="btn btn-ghost"
          onClick={() => { setBellOpen((v) => !v); setMenuOpen(false); }}
          aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
          style={{ position: 'relative' }}
        >
          <Icon name="notifications" />
          {unread > 0 && <span className="dot" />}
        </button>

        {bellOpen && (
          <div className="popover enter" style={{ width: 360 }}>
            <div className="row-between" style={{ padding: '4px 6px 12px' }}>
              <strong className="small">Notifications</strong>
              {unread > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="small muted" style={{ padding: 8 }}>Nothing yet.</p>
            ) : (
              <div className="stack" style={{ gap: 2, maxHeight: 340, overflowY: 'auto' }}>
                {notifications.slice(0, 12).map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 'var(--radius)',
                      background: item.readAt ? 'transparent' : 'var(--primary-fixed)',
                    }}
                  >
                    <div className="row-between">
                      <strong className="small">{item.subject}</strong>
                      <span className="tiny muted">{relativeTime(item.at)}</span>
                    </div>
                    <p className="small muted" style={{ marginTop: 2 }}>{item.body}</p>
                  </div>
                ))}
              </div>
            )}
            {data?.deliveryNotice && (
              <p className="tiny muted" style={{ padding: '10px 8px 0', borderTop: '1px solid var(--outline-variant)', marginTop: 8 }}>
                {data.deliveryNotice}
              </p>
            )}
          </div>
        )}

        <button
          className="avatar"
          onClick={() => { setMenuOpen((v) => !v); setBellOpen(false); }}
          aria-label="Account menu"
          aria-expanded={menuOpen}
        >
          {initials(user?.name)}
        </button>

        {menuOpen && (
          <div className="popover enter" style={{ width: 240 }}>
            <div className="stack" style={{ gap: 2, padding: '4px 8px 12px' }}>
              <strong className="small">{user?.name}</strong>
              <span className="tiny muted">{user?.email}</span>
              {user?.mfaEnabled ? (
                <Badge tone="verified" icon="verified_user">Two-factor on</Badge>
              ) : (
                <Badge tone="pending" icon="shield">Two-factor off</Badge>
              )}
            </div>
            <hr className="divider" />
            <Link to="/vault/security" className="menu-item">
              <Icon name="shield" size={18} /> Security settings
            </Link>
            <button
              className="menu-item"
              onClick={async () => {
                await signOut();
                navigate('/', { replace: true });
              }}
            >
              <Icon name="logout" size={18} /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
