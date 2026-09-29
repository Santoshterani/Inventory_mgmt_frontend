import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  // On load, if a token exists, validate it against GET /api/auth/me so a
  // refresh doesn't silently drop the session (FR-01).
  useEffect(() => {
    const token = localStorage.getItem('ams_token');
    if (!token) {
      setInitializing(false);
      return;
    }
    authService
      .me()
      .then((currentUser) => setUser(currentUser))
      .catch(() => {
        localStorage.removeItem('ams_token');
        setUser(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  const login = useCallback(async (username, password) => {
    setError(null);
    try {
      const loggedInUser = await authService.login(username, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        (err?.response?.status === 401
          ? 'Invalid username or password.'
          : 'Unable to sign in. Please try again.');
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, initializing, error, login, logout, setUser }),
    [user, initializing, error, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
