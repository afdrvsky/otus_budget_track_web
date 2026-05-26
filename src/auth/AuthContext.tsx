import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser, LoginRequest, RegisterRequest } from '../utils/types';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/api';
import { getToken, setToken, removeToken } from '../api/client';

const USER_KEY = 'budget_track_user';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function storeUser(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const hasToken = !!getToken();
    const user = hasToken ? getStoredUser() : null;
    return { user, isAuthenticated: hasToken && !!user, loading: false };
  });

  // Validate stored token on mount by calling a protected endpoint
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    // Light validation: try fetching categories. If 401, token is stale.
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.status === 401) {
          removeToken();
          storeUser(null);
          setState({ user: null, isAuthenticated: false, loading: false });
        }
      })
      .catch(() => {
        // Network error — keep session, don't force logout
      });
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const res = await apiLogin(data);
    setToken(res.session.access_token);
    storeUser(res.user);
    setState({ user: res.user, isAuthenticated: true, loading: false });
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await apiRegister(data);
    if (res.session) {
      setToken(res.session.access_token);
      storeUser(res.user);
      setState({ user: res.user, isAuthenticated: true, loading: false });
    }
  }, []);

  const logoutFn = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      removeToken();
      storeUser(null);
      setState({ user: null, isAuthenticated: false, loading: false });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout: logoutFn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
