import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CategoriesPage from '../pages/CategoriesPage';

jest.mock('../api/api', () => ({
  fetchCategories: jest.fn().mockResolvedValue([
    {
      id: 'c1',
      user_id: 'u1',
      name: 'Еда',
      type: 'expense',
      color: '#f97316',
      is_default: true,
      created_at: '',
      updated_at: '',
    },
    {
      id: 'c2',
      user_id: 'u1',
      name: 'Транспорт',
      type: 'expense',
      color: '#3b82f6',
      is_default: true,
      created_at: '',
      updated_at: '',
    },
    {
      id: 'c3',
      user_id: 'u1',
      name: 'Подписки',
      type: 'expense',
      color: '#8b5cf6',
      is_default: false,
      created_at: '',
      updated_at: '',
    },
    {
      id: 'c4',
      user_id: 'u1',
      name: 'Зарплата',
      type: 'income',
      color: '#22c55e',
      is_default: true,
      created_at: '',
      updated_at: '',
    },
  ]),
  fetchTransactions: jest.fn().mockResolvedValue([]),
  addCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
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

describe('CategoriesPage — отображение категорий', () => {
  it('показывает список категорий после загрузки', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Еда')).toBeInTheDocument();
    });

    expect(screen.getByText('Транспорт')).toBeInTheDocument();
    expect(screen.getByText('Зарплата')).toBeInTheDocument();
  });
});

describe('CategoriesPage — удаление категорий', () => {
  it('не показывает кнопку удаления для дефолтных категорий', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Еда')).toBeInTheDocument();
    });

    const allDeleteButtons = screen.queryAllByRole('button', { name: /удалить/i });
    expect(allDeleteButtons).toHaveLength(1);
  });

  it('показывает кнопку удаления только для пользовательских категорий', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Подписки')).toBeInTheDocument();
    });

    const deleteButtons = screen.queryAllByRole('button', { name: /удалить/i });
    expect(deleteButtons).toHaveLength(1);
  });

  it('показывает диалог подтверждения при удалении категории без транзакций', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Подписки')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /удалить/i }));

    await waitFor(() => {
      expect(screen.getByText(/Удалить категорию «Подписки»/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/не содержит транзакций/i)).toBeInTheDocument();
  });
});
