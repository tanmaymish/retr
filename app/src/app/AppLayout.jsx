import { Outlet } from 'react-router-dom';
import PhoneShell from '../components/frames/PhoneShell';
import Logo from '../components/Logo';

export default function AppLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: '32px 16px',
      }}
    >
      <Logo size={36} />
      <PhoneShell>
        <Outlet />
      </PhoneShell>
    </div>
  );
}
