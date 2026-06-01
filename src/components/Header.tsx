import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const navItems = [
  { to: '/', label: 'Главная' },
  { to: '/add', label: 'Добавить' },
  { to: '/stats', label: 'Статистика' },
  { to: '/categories', label: 'Категории' },
  { to: '/profile', label: 'Профиль' },
];

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-2 no-underline">
            <span className="text-2xl">💰</span>
            <span className="text-lg font-bold text-gray-900 hidden sm:inline">Budget Track</span>
          </NavLink>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <nav className="flex gap-1">
                {navItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
                <span className="text-sm text-gray-500 hidden sm:inline">
                  {user?.user_metadata?.full_name || user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Выйти
                </button>
              </div>
            </div>
          ) : (
            <nav className="flex gap-1">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                Вход
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                Регистрация
              </NavLink>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
