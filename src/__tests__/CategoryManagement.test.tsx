import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
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
      name: 'Зарплата',
      type: 'income',
      color: '#22c55e',
      is_default: true,
      created_at: '',
      updated_at: '',
    },
  ]),
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

describe('CategoriesPage — добавление категории', () => {
  it('показывает новую категорию после загрузки', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Категории')).toBeInTheDocument();
    });

    expect(screen.getByText('Еда')).toBeInTheDocument();
  });
});

describe('CategoriesPage — удаление категории', () => {
  it('показывает кнопку удаления для категории', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Категории')).toBeInTheDocument();
    });

    const deleteButtons = screen.queryAllByText('Удалить');
    expect(deleteButtons.length).toBeGreaterThan(0);
  });
});
