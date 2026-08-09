import { Routes, Route, Navigate } from 'react-router-dom';
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
      {/* The real app — one persistent phone frame, tab-navigable. This is
          the landing experience now. */}
      <Route path="/" element={<Navigate to="/app/home" replace />} />
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
