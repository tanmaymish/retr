import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/theme.css';
import App from './App.jsx';
import { AuthProvider } from './state/AuthContext';
import { ToastProvider } from './components/ui';
import { initAnalytics } from './lib/analytics';

// No-op unless a provider is configured, so the default build loads no
// third-party script at all.
initAnalytics();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* The router has to know it may be mounted under /<repo>/ on Pages. */}
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
