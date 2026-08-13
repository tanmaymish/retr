import { Routes, Route, Navigate } from 'react-router-dom';
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
  return (
    <Routes>
      {/* The website — a normal desktop layout (sidebar nav, wide content),
          no phone chrome anywhere. This is the landing experience now. */}
      <Route path="/" element={<Navigate to="/site/home" replace />} />
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

      {/* The phone-simulator app, same features, phone chrome — kept as an
          alternate view, linked from the website sidebar. */}
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<AppHome />} />
        <Route path="wealth" element={<AppWealth />} />
        <Route path="goals" element={<AppGoals />} />
        <Route path="vault" element={<AppVault />} />
        <Route path="you" element={<AppYou />} />
      </Route>

      {/* The original design-handoff gallery: all 27 wireframe screens,
          preserved exactly as before. */}
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/screen/:id" element={<ScreenView />} />
      <Route path="/ask" element={<Ask />} />
    </Routes>
  );
}
