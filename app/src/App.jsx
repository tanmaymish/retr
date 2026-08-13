import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Spinner } from './components/ui';
import { trackPageView } from './lib/analytics';
import { useAuth } from './state/AuthContext';
import Home from './site/Home';
import About from './site/About';
import Contact from './site/Contact';
import PreparednessCheck from './site/PreparednessCheck';
import { CalculatorPage, CalculatorsHub } from './site/Calculators';
import { NotFound, Privacy, Terms } from './site/Legal';
import { MfaChallenge, SignIn, SignUp } from './auth/AuthPages';
import InviteAccept from './auth/InviteAccept';
import Onboarding from './auth/Onboarding';
import AppShell from './app/AppShell';
import Dashboard from './app/Dashboard';
import Documents from './app/Documents';
import DocumentDetail from './app/DocumentDetail';
import Upload from './app/Upload';
import Family from './app/Family';
import Trustees from './app/Trustees';
import Shared from './app/Shared';
import Activity from './app/Activity';
import Reminders from './app/Reminders';
import Timeline from './app/Timeline';
import Security from './app/Security';
import Leads from './app/Leads';

export default function App() {
  usePageViews();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/preparedness-check" element={<PreparednessCheck />} />
      <Route path="/calculators" element={<CalculatorsHub />} />
      <Route path="/calculators/:slug" element={<CalculatorPage />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/sign-in" element={<GuestOnly><SignIn /></GuestOnly>} />
      <Route path="/create-vault" element={<GuestOnly><SignUp /></GuestOnly>} />
      <Route path="/verify" element={<MfaChallenge />} />
      <Route path="/invite/:token" element={<InviteAccept />} />

      <Route path="/onboarding" element={<Protected skipOnboardingCheck><Onboarding /></Protected>} />

      <Route path="/vault" element={<Protected><AppShell /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="documents" element={<Documents />} />
        <Route path="documents/:id" element={<DocumentDetail />} />
        <Route path="add" element={<Upload />} />
        <Route path="reminders" element={<Reminders />} />
        <Route path="timeline" element={<Timeline />} />
        <Route path="family" element={<Family />} />
        <Route path="trustees" element={<Trustees />} />
        <Route path="shared" element={<Shared />} />
        <Route path="activity" element={<Activity />} />
        <Route path="security" element={<Security />} />
        <Route path="enquiries" element={<Leads />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

/** Client-side routing means page views are ours to report. */
function usePageViews() {
  const { pathname } = useLocation();
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);
}

/**
 * Route guard. The server enforces access on every request regardless — this
 * only decides what to render, so an expired session lands on sign-in rather
 * than on a screen full of failed requests.
 */
function Protected({ children, skipOnboardingCheck = false }) {
  const { user, status, mfaRequired } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <Spinner label="Checking your session" />;
  if (mfaRequired) {
    return <Navigate to={`/verify?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (!user) {
    return <Navigate to={`/sign-in?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (!skipOnboardingCheck && !user.onboarded) return <Navigate to="/onboarding" replace />;

  return children;
}

function GuestOnly({ children }) {
  const { user, status } = useAuth();
  if (status === 'loading') return <Spinner />;
  if (user) return <Navigate to={user.onboarded ? '/vault' : '/onboarding'} replace />;
  return children;
}
