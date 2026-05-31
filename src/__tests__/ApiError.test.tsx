import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '../pages/Dashboard';

jest.mock('../api/api', () => ({
  fetchTransactions: jest.fn().mockRejectedValue(new Error('Network error')),
  fetchCategories: jest.fn().mockResolvedValue([]),
}));

jest.mock('../api/client', () => ({
  default: { get: jest.fn(), post: jest.fn() },
  getToken: jest.fn(() => null),
  setToken: jest.fn(),
  removeToken: jest.fn(),
}));

jest.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: null,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe('Dashboard — обработка ошибок', () => {
  it('показывает сообщение об ошибке при неудачной загрузке', async () => {
    renderWithProviders(<Dashboard />);

    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/не удалось загрузить транзакции/i)).toBeInTheDocument();
    });
  });
});
