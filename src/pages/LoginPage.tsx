import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { sanitizeApiError } from '../utils/helpers';
import AuthButton from '../components/AuthButton';

type AuthBanner = { type: 'success'; text: string } | { type: 'error'; text: string } | null;

const KNOWN_HASH_ERRORS: Record<string, string> = {
  otp_expired: 'Ссылка для подтверждения устарела. Зарегистрируйтесь заново.',
  access_denied: 'Доступ запрещён.',
  server_error: 'Ошибка сервера. Попробуйте позже.',
};

function getAuthBanner(): AuthBanner {
  const hash = window.location.hash.substring(1);
  if (!hash) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('confirmed') === 'true') {
      return { type: 'success', text: 'Email успешно подтверждён! Теперь вы можете войти.' };
    }
    return null;
  }
  const entries = Object.fromEntries(new URLSearchParams(hash).entries());
  const code = entries.error_code || entries.error;
  if (code && KNOWN_HASH_ERRORS[code]) {
    return { type: 'error', text: KNOWN_HASH_ERRORS[code] };
  }
  if (code) {
    return { type: 'error', text: 'Произошла ошибка при подтверждении.' };
  }
  return null;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const banner = useMemo(() => getAuthBanner(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err: unknown) {
      setError(sanitizeApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Вход</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-50">
        {banner?.type === 'success' && (
          <div className="bg-income-50 text-income-700 px-4 py-3 rounded-lg text-sm mb-4">
            {banner.text}
          </div>
        )}
        {banner?.type === 'error' && (
          <div className="bg-expense-50 text-expense-700 px-4 py-3 rounded-lg text-sm mb-4">
            {banner.text}
          </div>
        )}
        {error && (
          <div className="bg-expense-50 text-expense-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Зарегистрироваться
          </Link>
        </p>
        <p className="text-sm text-gray-400 mt-2 text-center">
          <Link to="/recover" className="hover:text-primary-600 transition-colors">
            Забыли пароль?
          </Link>
        </p>
      </div>

      <div className="mt-4 bg-white rounded-xl p-6 shadow-sm border border-gray-50">
        <div className="flex justify-center">
          <AuthButton />
        </div>
      </div>
    </div>
  );
}
