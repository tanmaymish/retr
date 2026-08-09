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
        <Route path="vault" element={<WebsiteVault />} />
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
