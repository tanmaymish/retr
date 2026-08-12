import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

/**
 * Session state for the whole app. The server is the source of truth: this
 * asks it who we are on load, and re-asks after anything that could change it.
 * Nothing about the session is persisted client-side.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [status, setStatus] = useState('loading');

  const refresh = useCallback(async () => {
    try {
      const data = await api.get('/auth/me');
      setUser(data.user);
      setMfaRequired(Boolean(data.mfaRequired));
      return data.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setStatus('ready');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      user,
      status,
      mfaRequired,
      refresh,
      setUser,

      async signIn(credentials) {
        const data = await api.post('/auth/login', credentials);
        if (data.mfaRequired) {
          setMfaRequired(true);
          setUser(null);
          return { mfaRequired: true };
        }
        setMfaRequired(false);
        setUser(data.user);
        return { mfaRequired: false, user: data.user };
      },

      async verifyMfa(code) {
        const data = await api.post('/auth/mfa/verify', { code });
        setMfaRequired(false);
        setUser(data.user);
        return data.user;
      },

      async register(details) {
        const data = await api.post('/auth/register', details);
        setUser(data.user);
        return data.user;
      },

      async signOut() {
        await api.post('/auth/logout').catch(() => {});
        setUser(null);
        setMfaRequired(false);
      },
    }),
    [user, status, mfaRequired, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider.');
  return context;
}
