import { NavLink } from 'react-router-dom';

// The real app: one persistent iOS-style device frame with a bottom tab bar,
// content swapping underneath it — unlike the design gallery, where every
// screen gets its own standalone frame. This is what "open the app" means.
const TABS = [
  { to: '/app/home', label: 'Home', icon: IconHome },
  { to: '/app/wealth', label: 'Wealth', icon: IconWealth },
  { to: '/app/goals', label: 'Goals', icon: IconGoals },
  { to: '/app/vault', label: 'Vault', icon: IconVault },
  { to: '/app/you', label: 'You', icon: IconYou },
];

export default function PhoneShell({ children }) {
  return (
    <div
      style={{
        width: 402,
        height: 874,
        borderRadius: 48,
        overflow: 'hidden',
        position: 'relative',
        background: '#F2F2F7',
        boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
        fontFamily: '-apple-system, system-ui, sans-serif',
        flex: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 11,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 126,
          height: 37,
          borderRadius: 24,
          background: '#000',
          zIndex: 50,
        }}
      />
      <div
        style={{
          height: 47,
          flex: 'none',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: 8,
        }}
      >
        <span style={{ font: '600 15px -apple-system, system-ui', letterSpacing: 0.2 }}>9:41</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', background: '#fff' }}>{children}</div>

      <div style={{ flex: 'none', borderTop: '1px solid #ddd9d7', background: 'rgba(255,255,255,0.92)' }}>
        <div style={{ display: 'flex' }}>
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              style={({ isActive }) => ({
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '8px 0 4px',
                color: isActive ? '#ec3013' : '#8a8785',
                textDecoration: 'none',
              })}
            >
              {({ isActive }) => (
                <>
                  <tab.icon color={isActive ? '#ec3013' : '#8a8785'} />
                  <span style={{ font: '600 9.5px Archivo, sans-serif' }}>{tab.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8 }}>
          <div style={{ width: 139, height: 5, borderRadius: 100, background: 'rgba(0,0,0,0.25)' }} />
        </div>
      </div>
    </div>
  );
}

function IconHome({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 11L12 4l8 7v8a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-8z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function IconWealth({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 20V10M11 20V4M18 20v-6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconGoals({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.5" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}
function IconVault({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="10" width="16" height="10" stroke={color} strokeWidth="1.8" />
      <path d="M8 10V7a4 4 0 018 0v3" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}
function IconYou({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke={color} strokeWidth="1.8" />
      <path d="M5 20c1.2-4 4.2-6 7-6s5.8 2 7 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
