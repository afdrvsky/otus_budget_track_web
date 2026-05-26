import { useState } from 'react';
import { Link } from 'react-router-dom';
import { recoverPassword } from '../api/api';

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await recoverPassword(email);
      setSent(true);
    } catch {
      setError('Не удалось отправить письмо. Проверьте email и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Восстановление пароля</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-50">
        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-4xl">📧</div>
            <p className="text-sm text-gray-600">
              Письмо для сброса пароля отправлено на <strong>{email}</strong>. Проверьте почту и
              следуйте инструкции.
            </p>
            <Link
              to="/login"
              className="inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Вернуться к входу
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-expense-50 text-expense-700 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
            <p className="text-sm text-gray-500 mb-4">
              Введите email, на который зарегистрирован аккаунт. Мы отправим ссылку для сброса
              пароля.
            </p>
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
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Отправка...' : 'Отправить ссылку'}
              </button>
            </form>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Вспомнили пароль?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Войти
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
