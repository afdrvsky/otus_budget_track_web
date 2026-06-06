import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const accessToken = params.get('access_token');
        const expiresIn = params.get('expires_in');

        if (!accessToken) {
          const search = new URLSearchParams(window.location.search);
          const errorCode =
            search.get('error_description') || search.get('error') || 'no_token';
          throw new Error(errorCode);
        }

        await handleOAuthCallback(accessToken, expiresIn ?? undefined);

        navigate('/', { replace: true });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'unknown_error';
        setError(message);
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    }

    handleCallback();
  }, [navigate, handleOAuthCallback]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-expense-600 text-sm">Ошибка авторизации: {error}</p>
          <p className="text-gray-400 text-xs mt-2">Перенаправляем на страницу входа...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        <p className="text-gray-500 mt-3 text-sm">Выполняем вход...</p>
      </div>
    </div>
  );
}
