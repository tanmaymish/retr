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
import { InsightPost, InsightsIndex } from './site/Insights';
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

// The dashboard product, from main. It keeps its own routes under /site
// and /app; the advisory site keeps the root.
import WebsiteLayout from './website/WebsiteLayout';
import WebsiteHome from './website/WebsiteHome';
import WebsiteWealth from './website/WebsiteWealth';
import WebsiteGoals from './website/WebsiteGoals';
import WebsiteVault from './website/WebsiteVault';
import WebsiteProfile from './website/WebsiteProfile';
import WebsiteAdvisor from './website/WebsiteAdvisor';
import WebsiteEnterprise from './website/WebsiteEnterprise';
import WebsiteAsk from './website/WebsiteAsk';
import WebsitePanelPage from './website/WebsitePanelPage';
import AppLayout from './app/AppLayout';
import AppHome from './app/AppHome';
import AppWealth from './app/AppWealth';
import AppGoals from './app/AppGoals';
import AppVault from './app/AppVault';
import AppYou from './app/AppYou';
import Gallery from './screens/Home';
import ScreenView from './screens/ScreenView';
import Ask from './screens/Ask';

export default function App() {
  usePageViews();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/preparedness-check" element={<PreparednessCheck />} />
      <Route path="/calculators" element={<CalculatorsHub />} />
      <Route path="/calculators/:slug" element={<CalculatorPage />} />
      <Route path="/insights" element={<InsightsIndex />} />
      <Route path="/insights/:slug" element={<InsightPost />} />
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

      {/* The dashboard product. The advisory site holds the root, so this
          keeps its own prefix rather than taking the landing page. */}
      <Route path="/site" element={<WebsiteLayout />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<WebsiteHome />} />
        <Route path="wealth" element={<WebsiteWealth />} />
        <Route path="goals" element={<WebsiteGoals />} />
        <Route
          path="goal-detail"
          element={
            <WebsitePanelPage
              kicker="GOALS"
              title="Goal detail"
              description="A single goal's funding maths, and what it touches elsewhere in the plan."
              screenId="5c"
            />
          }
        />
        <Route path="vault" element={<WebsiteVault />} />
        <Route
          path="gap-explainer"
          element={
            <WebsitePanelPage
              kicker="PROTECTION"
              title="Where the gap comes from"
              description="The assumptions behind the ₹1.2 Cr number, not just the number."
              screenId="3b"
            />
          }
        />
        <Route
          path="income-protection"
          element={
            <WebsitePanelPage
              kicker="PROTECTION"
              title="Income protection"
              description="A lump sum and a length of time are different answers to the same question."
              screenId="6b"
            />
          }
        />
        <Route
          path="products"
          element={
            <WebsitePanelPage
              kicker="PRODUCTS"
              title="Product comparison"
              description="Provenance under every fact — including what a stale or unavailable price looks like."
              screenId="6c"
              width={880}
            />
          }
        />
        <Route
          path="other-gaps"
          element={
            <WebsitePanelPage
              kicker="GAPS"
              title="Health, education & liquidity"
              description="The other three gaps, drawn the same way life protection was — consequence first, product last."
              screenId="5e"
              panelIndices={[0, 1, 2]}
            />
          }
        />
        <Route
          path="retirement"
          element={
            <WebsitePanelPage
              kicker="RETIREMENT"
              title="Retirement"
              description="Four stages, not one number — creation, the handover, spending it, and what's left."
              screenId="6a"
              panelIndices={[0, 1]}
            />
          }
        />
        <Route
          path="what-if"
          element={
            <WebsitePanelPage
              kicker="SCENARIOS"
              title="What if"
              description="Current, scenario and impact — every projection stamped as an assumption, not a guarantee."
              screenId="3d"
            />
          }
        />
        <Route
          path="conflicts"
          element={
            <WebsitePanelPage
              kicker="PORTFOLIO"
              title="Conflicts & duplication"
              description="Three goals competing for one surplus, and cover you're already paying for twice."
              screenId="3e"
            />
          }
        />
        <Route
          path="action-plan"
          element={
            <WebsitePanelPage
              kicker="COACH VIEW"
              title="Action plan"
              description="Today, this month, in 3 months, in 12 months — one plan, not fifty products."
              screenId="3f"
            />
          }
        />
        <Route
          path="activity"
          element={
            <WebsitePanelPage
              kicker="NOTIFICATIONS"
              title="Activity & monitoring"
              description="Eleven triggers watched, most months quiet — and what a life event changes."
              screenId="6d"
              panelIndices={[0, 1]}
            />
          }
        />
        <Route
          path="onboarding"
          element={
            <WebsitePanelPage
              kicker="ONBOARDING"
              title="Get started"
              description="Six questions, each labelled with the calculation it feeds and the time it costs."
              screenId="5a"
              panelIndices={[0, 1, 2]}
            />
          }
        />
        <Route
          path="cold-start"
          element={
            <WebsitePanelPage
              kicker="ONBOARDING"
              title="Cold start"
              description="Honest when the engine knows almost nothing yet — scores read — —, not a guess dressed up as one."
              screenId="5b"
            />
          }
        />
        <Route path="profile" element={<WebsiteProfile />} />
        <Route path="advisor" element={<WebsiteAdvisor />} />
        <Route path="enterprise" element={<WebsiteEnterprise />} />
        <Route path="ask" element={<WebsiteAsk />} />
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
