import { NavLink, Outlet, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import './WebsiteLayout.css';

const GROUPS = [
  {
    label: null,
    items: [{ to: '/site/home', label: 'Home' }],
  },
  {
    label: 'MONEY',
    items: [
      { to: '/site/wealth', label: 'Wealth' },
      { to: '/site/vault', label: 'Vault' },
    ],
  },
  {
    label: 'GOALS',
    items: [
      { to: '/site/goals', label: 'Funding order' },
      { to: '/site/goal-detail', label: 'Goal detail' },
    ],
  },
  {
    label: 'PROTECTION',
    items: [
      { to: '/site/gap-explainer', label: 'Gap explainer' },
      { to: '/site/income-protection', label: 'Income protection' },
      { to: '/site/products', label: 'Product comparison' },
    ],
  },
  {
    label: 'GAPS & RETIREMENT',
    items: [
      { to: '/site/other-gaps', label: 'Health, education, liquidity' },
      { to: '/site/retirement', label: 'Retirement' },
    ],
  },
  {
    label: 'PLANNING TOOLS',
    items: [
      { to: '/site/what-if', label: 'What if' },
      { to: '/site/conflicts', label: 'Conflicts & duplication' },
      { to: '/site/action-plan', label: 'Action plan' },
      { to: '/site/activity', label: 'Activity & monitoring' },
    ],
  },
  {
    label: 'GET STARTED',
    items: [
      { to: '/site/onboarding', label: 'Onboarding' },
      { to: '/site/cold-start', label: 'Cold start' },
    ],
  },
  {
    label: 'YOU',
    items: [{ to: '/site/profile', label: 'Profile' }],
  },
  {
    label: 'OTHER VIEWS',
    items: [
      { to: '/site/advisor', label: 'Advisor co-pilot' },
      { to: '/site/enterprise', label: 'Enterprise console' },
      { to: '/site/ask', label: 'Ask about your money' },
    ],
  },
];

export default function WebsiteLayout() {
  return (
    <div className="site">
      <aside className="site-sidebar">
        <div className="site-sidebar-brand">
          <Logo size={30} align="left" tagline={false} />
        </div>
        <nav className="site-nav">
          {GROUPS.map((group, gi) => (
            <div key={gi} className="site-nav-group">
              {group.label && <div className="site-nav-group-label">{group.label}</div>}
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `site-nav-link${isActive ? ' active' : ''}`}
                >
                  {item.label.toUpperCase()}
                </NavLink>
              ))}
            </div>
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
