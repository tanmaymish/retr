import { Outlet } from 'react-router-dom';
import PhoneShell from '../components/frames/PhoneShell';
import Logo from '../components/Logo';

export default function AppLayout() {
  return (
    <div className="app-shell-page">
      <div className="app-shell-logo">
        <Logo size={36} />
      </div>
      <PhoneShell>
        <Outlet />
      </PhoneShell>
    </div>
  );
}
