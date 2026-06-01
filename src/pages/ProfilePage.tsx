import { useAuth } from '../auth/AuthContext';

export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[30vh]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">Пользователь не авторизован</p>
      </div>
    );
  }

  const displayName = user.name || user.user_metadata?.full_name || user.email;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Профиль</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-50">
        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={displayName}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-lg font-semibold text-gray-900 truncate">Привет, {displayName}!</p>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-50 space-y-4">
        <h2 className="text-base font-semibold text-gray-800">Данные аккаунта</h2>
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">ID</dt>
            <dd className="text-sm text-gray-900 font-mono">{user.id}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="text-sm text-gray-900">{user.email}</dd>
          </div>
          {user.name && (
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Имя</dt>
              <dd className="text-sm text-gray-900">{user.name}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
