import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { sanitizeApiError } from '../utils/helpers';

const PASSWORD_MIN_LENGTH = 8;

function validatePassword(p: string): string | null {
  if (p.length < PASSWORD_MIN_LENGTH)
    return `Пароль должен быть не менее ${PASSWORD_MIN_LENGTH} символов`;
  if (!/[A-ZА-Я]/.test(p)) return 'Пароль должен содержать хотя бы одну заглавную букву';
  if (!/[0-9]/.test(p)) return 'Пароль должен содержать хотя бы одну цифру';
  return null;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const pwError = validatePassword(password);
    if (pwError) {
      setError(pwError);
      return;
    }
    setLoading(true);
    try {
      await register({ email, password, full_name: fullName || undefined });
      setRegistered(true);
    } catch (err: unknown) {
      setError(sanitizeApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Регистрация</h1>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-50 text-center space-y-4">
          <div className="text-4xl">📧</div>
          <h2 className="text-lg font-semibold text-gray-900">Подтвердите email</h2>
          <p className="text-sm text-gray-600">
            Мы отправили письмо на <strong>{email}</strong>. Откройте его и нажмите ссылку для
            подтверждения, затем войдите в аккаунт.
          </p>
          <Link
            to="/login"
            className="inline-block w-full py-3 rounded-lg text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors no-underline"
          >
            Перейти к входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Регистрация</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-50">
        {error && (
          <div className="bg-expense-50 text-expense-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Имя (необязательно)
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              maxLength={100}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
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
              minLength={PASSWORD_MIN_LENGTH}
              autoComplete="new-password"
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
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
