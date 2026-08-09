import { NavLink, Outlet, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import './WebsiteLayout.css';

const PRIMARY = [
  { to: '/site/home', label: 'Home' },
  { to: '/site/wealth', label: 'Wealth' },
  { to: '/site/goals', label: 'Goals' },
  { to: '/site/vault', label: 'Vault' },
  { to: '/site/profile', label: 'Profile' },
];

const OTHER_VIEWS = [
  { to: '/site/advisor', label: 'Advisor co-pilot' },
  { to: '/site/enterprise', label: 'Enterprise console' },
  { to: '/site/ask', label: 'Ask about your money' },
];

export default function WebsiteLayout() {
  return (
    <div className="site">
      <aside className="site-sidebar">
        <div className="site-sidebar-brand">
          <Logo size={30} align="left" tagline={false} />
        </div>
        <nav className="site-nav">
          {PRIMARY.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `site-nav-link${isActive ? ' active' : ''}`}
            >
              {item.label.toUpperCase()}
            </NavLink>
          ))}
          <div className="site-nav-group-label">OTHER VIEWS</div>
          {OTHER_VIEWS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `site-nav-link${isActive ? ' active' : ''}`}
            >
              {item.label.toUpperCase()}
            </NavLink>
          ))}
          <div className="site-nav-group-label">MORE</div>
          <Link to="/app/home" className="site-nav-link">MOBILE APP →</Link>
          <Link to="/gallery" className="site-nav-link">DESIGN GALLERY →</Link>
        </nav>
      </aside>
      <main className="site-main">
        <div className="site-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
