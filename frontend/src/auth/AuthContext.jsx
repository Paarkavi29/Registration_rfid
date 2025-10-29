import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api';
import { setToken as persistToken } from '../api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem('auth_token') || ''; } catch { return ''; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    persistToken(token || '');
    if (token) {
      authApi.me().then(d => setUser(d.user)).catch(() => setUser(null));
    } else {
      setUser(null);
    }
  }, [token]);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    error,
    async login(email, password) {
      setLoading(true); setError('');
      try {
        const { token: t, user: u } = await authApi.login({ email, password });
        setToken(t);
        setUser(u);
        return true;
      } catch (e) {
        setError(e.message || 'Login failed');
        return false;
      } finally { setLoading(false); }
    },
    async signup(email, password, fullName) {
      setLoading(true); setError('');
      try {
        const { token: t, user: u } = await authApi.signup({ email, password, fullName });
        setToken(t);
        setUser(u);
        return true;
      } catch (e) {
        setError(e.message || 'Signup failed');
        return false;
      } finally { setLoading(false); }
    },
    logout() {
      setToken('');
      setUser(null);
    }
  }), [user, token, loading, error]);

  return (
    <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

