import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser, CurrentUser, LoginRequest, RegisterRequest } from '../utils/types';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  fetchCurrentUser,
  getGoogleLoginUrl,
} from '../api/api';
import { getStoredSession, setStoredSession, clearSession, getStoredUserKey } from '../api/client';
import { GAEvents } from '../analytics/gtag';

interface AuthState {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  loginWithGoogle: () => void;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  handleOAuthCallback: (accessToken: string, expiresIn?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(getStoredUserKey());
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function storeUser(user: CurrentUser | AuthUser | null) {
  const key = getStoredUserKey();
  if (user) {
    localStorage.setItem(key, JSON.stringify(user));
  } else {
    localStorage.removeItem(key);
  }
}

function isSessionExpired(): boolean {
  const session = getStoredSession();
  if (!session) return true;
  if (session.expires_at && Date.now() / 1000 > session.expires_at) return true;
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const session = getStoredSession();
    const expired = !session || isSessionExpired();
    if (expired) {
      clearSession();
      storeUser(null);
      return { user: null, isAuthenticated: false, loading: false };
    }
    const user = getStoredUser();
    return { user, isAuthenticated: !!user, loading: true };
  });

  useEffect(() => {
    if (!state.isAuthenticated) return;

    const session = getStoredSession();
    if (!session?.access_token) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    fetchCurrentUser()
      .then(user => {
        storeUser(user);
        setState({ user, isAuthenticated: true, loading: false });
      })
      .catch(err => {
        if (err?.response?.status === 401) {
          clearSession();
          storeUser(null);
          setState({ user: null, isAuthenticated: false, loading: false });
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      clearSession();
      storeUser(null);
      setState({ user: null, isAuthenticated: false, loading: false });
      window.location.href = '/login';
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const res = await apiLogin(data);
    setStoredSession({
      access_token: res.session.access_token,
      expires_at: res.session.expires_at,
    });
    const user = await fetchCurrentUser();
    storeUser(user);
    setState({ user, isAuthenticated: true, loading: false });
    GAEvents.login('email');
  }, []);

  const loginWithGoogle = useCallback(() => {
    window.location.href = getGoogleLoginUrl();
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await apiRegister(data);
    if (res.session) {
      setStoredSession({
        access_token: res.session.access_token,
        expires_at: res.session.expires_at,
      });
      const user = await fetchCurrentUser();
      storeUser(user);
      setState({ user, isAuthenticated: true, loading: false });
      GAEvents.register('email');
    }
  }, []);

  const logoutFn = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      GAEvents.logout();
      clearSession();
      storeUser(null);
      setState({ user: null, isAuthenticated: false, loading: false });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const user = await fetchCurrentUser();
    storeUser(user);
    setState(prev => ({ ...prev, user }));
  }, []);

  const handleOAuthCallback = useCallback(async (accessToken: string, expiresIn?: string) => {
    const expiresAt = expiresIn
      ? Math.floor(Date.now() / 1000) + parseInt(expiresIn, 10)
      : undefined;

    setStoredSession({ access_token: accessToken, expires_at: expiresAt });
    const user = await fetchCurrentUser();
    storeUser(user);
    setState({ user, isAuthenticated: true, loading: false });
    GAEvents.login('google');
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, loginWithGoogle, register, logout: logoutFn, refreshUser, handleOAuthCallback }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
