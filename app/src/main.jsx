import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import './styles/theme.css';
import App from './App.jsx';
import { AuthProvider } from './state/AuthContext';
import { ToastProvider } from './components/ui';
import { initAnalytics } from './lib/analytics';

// No-op unless a provider is configured, so the default build loads no
// third-party script at all.
initAnalytics();

/* Every real deployment uses real URLs. The exception is the single-file
   preview build, which is opened from a sandbox that has no server behind it
   to answer /calculators — there, and only there, routes live in the hash. */
const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter;
const basename = import.meta.env.VITE_HASH_ROUTER
  ? undefined
  : import.meta.env.BASE_URL.replace(/\/$/, '');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* The router has to know it may be mounted under /<repo>/ on Pages. */}
    <Router basename={basename}>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </Router>
  </StrictMode>,
);
