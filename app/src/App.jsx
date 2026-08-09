import { Routes, Route } from 'react-router-dom';
import Home from './screens/Home';
import ScreenView from './screens/ScreenView';
import Ask from './screens/Ask';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/screen/:id" element={<ScreenView />} />
      <Route path="/ask" element={<Ask />} />
    </Routes>
  );
}
