import axios from 'axios';

const TOKEN_KEY = 'budget_track_token';
const USER_KEY = 'budget_track_session';

function getApiUrl(): string {
  const url = import.meta.env.VITE_API_URL;
  if (!url && import.meta.env.DEV) {
    return 'http://localhost:8080/api';
  }
  if (!url) {
    throw new Error('VITE_API_URL is not configured');
  }
  return url;
}

export interface StoredSession {
  access_token: string;
  expires_at?: number;
}

const client = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

client.interceptors.request.use(config => {
  const session = getStoredSession();
  if (session?.access_token) {
    if (session.expires_at && Date.now() / 1000 > session.expires_at) {
      clearSession();
      return config;
    }
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

client.interceptors.response.use(
  res => res,
  error => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthEndpoint =
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/recover');
      if (!isAuthEndpoint) {
        clearSession();
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export function getStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(session: StoredSession): void {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUserKey(): string {
  return USER_KEY;
}

export default client;
