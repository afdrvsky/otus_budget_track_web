import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CategoriesPage from '../pages/CategoriesPage';

import type { Category, Transaction, TransactionType } from '../utils/types';

jest.mock('../api/api', () => ({
  fetchCategories: jest.fn(),
  fetchTransactions: jest.fn(),
  addCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
}));

import {
  fetchCategories,
  fetchTransactions,
  addCategory,
  updateCategory,
  deleteCategory,
} from '../api/api';

const mockFetchCategories = fetchCategories as jest.MockedFunction<typeof fetchCategories>;
const mockFetchTransactions = fetchTransactions as jest.MockedFunction<typeof fetchTransactions>;
const mockAddCategory = addCategory as jest.MockedFunction<typeof addCategory>;
const mockUpdateCategory = updateCategory as jest.MockedFunction<typeof updateCategory>;
const mockDeleteCategory = deleteCategory as jest.MockedFunction<typeof deleteCategory>;

const defaultCategories: Category[] = [
  {
    id: 'c1',
    user_id: 'u1',
    name: 'Еда',
    type: 'expense' as TransactionType,
    color: '#f97316',
    is_default: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'c2',
    user_id: 'u1',
    name: 'Транспорт',
    type: 'expense' as TransactionType,
    color: '#3b82f6',
    is_default: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'c4',
    user_id: 'u1',
    name: 'Зарплата',
    type: 'income' as TransactionType,
    color: '#22c55e',
    is_default: true,
    created_at: '',
    updated_at: '',
  },
];

const customCategory: Category = {
  id: 'c3',
  user_id: 'u1',
  name: 'Подписки',
  type: 'expense' as TransactionType,
  color: '#8b5cf6',
  is_default: false,
  created_at: '',
  updated_at: '',
};

const allCategories = [...defaultCategories, customCategory];

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

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchCategories.mockResolvedValue([...allCategories]);
  mockFetchTransactions.mockResolvedValue([]);
  mockAddCategory.mockResolvedValue({} as Category);
  mockUpdateCategory.mockResolvedValue({} as Category);
  mockDeleteCategory.mockResolvedValue(undefined);
});

describe('CategoriesPage — отображение', () => {
  it('показывает список категорий после загрузки', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Еда')).toBeInTheDocument();
    });

    expect(screen.getByText('Транспорт')).toBeInTheDocument();
    expect(screen.getByText('Зарплата')).toBeInTheDocument();
    expect(screen.getByText('Подписки')).toBeInTheDocument();
  });

  it('группирует категории по типу (расходы / доходы)', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Еда')).toBeInTheDocument();
    });

    expect(screen.getByText('Расходы')).toBeInTheDocument();
    expect(screen.getByText('Доходы')).toBeInTheDocument();
  });
});

describe('CategoriesPage — дефолтные категории', () => {
  it('не показывает кнопку удаления для дефолтных категорий', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Еда')).toBeInTheDocument();
    });

    const deleteButtons = screen.queryAllByRole('button', { name: /удалить/i });
    expect(deleteButtons).toHaveLength(1);
  });

  it('показывает метку «По умолчанию» для дефолтных категорий', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Еда')).toBeInTheDocument();
    });

    expect(screen.getAllByText(/по умолчанию/i).length).toBeGreaterThanOrEqual(1);
  });
});

describe('CategoriesPage — добавление категории', () => {
  it('открывает форму при клике «Добавить»', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Еда')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const addButtons = screen.getAllByRole('button', { name: /\+ добавить/i });
    await user.click(addButtons[0]);

    expect(screen.getByText(/новая категория/i)).toBeInTheDocument();
  });

  it('вызывает addCategory при отправке формы', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Еда')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const addButtons = screen.getAllByRole('button', { name: /\+ добавить/i });
    await user.click(addButtons[0]);

    await user.type(screen.getByLabelText(/название/i), 'Кафе');
    const submitBtn = screen.getByRole('button', { name: /^добавить$/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockAddCategory).toHaveBeenCalledWith('Кафе', 'expense', '#f97316');
    });
  });

  it('показывает ошибку при пустом названии', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Еда')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const addButtons = screen.getAllByRole('button', { name: /\+ добавить/i });
    await user.click(addButtons[0]);

    const submitBtn = screen.getByRole('button', { name: /^добавить$/i });
    await user.click(submitBtn);

    expect(screen.getByText(/введите название/i)).toBeInTheDocument();
    expect(mockAddCategory).not.toHaveBeenCalled();
  });
});

describe('CategoriesPage — редактирование категории', () => {
  it('открывает форму с текущими данными при редактировании', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Подписки')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const editButtons = screen.getAllByRole('button', { name: /редактировать/i });
    const subscriptionsEdit = editButtons.find(btn => {
      const card = btn.closest('.flex.items-center.justify-between');
      return card && card.textContent?.includes('Подписки');
    });
    await user.click(subscriptionsEdit!);

    expect(screen.getByText(/редактировать категорию/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Подписки')).toBeInTheDocument();
  });

  it('вызывает updateCategory при сохранении', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Подписки')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const editButtons = screen.getAllByRole('button', { name: /редактировать/i });
    const subscriptionsEdit = editButtons.find(btn => {
      const card = btn.closest('.flex.items-center.justify-between');
      return card && card.textContent?.includes('Подписки');
    });
    await user.click(subscriptionsEdit!);

    const nameInput = screen.getByLabelText(/название/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Стриминги');
    await user.click(screen.getByRole('button', { name: /сохранить/i }));

    await waitFor(() => {
      expect(mockUpdateCategory).toHaveBeenCalledWith(
        'c3',
        expect.objectContaining({ name: 'Стриминги' })
      );
    });
  });
});

describe('CategoriesPage — удаление категории без транзакций', () => {
  it('показывает диалог подтверждения при клике «Удалить»', async () => {
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

  it('вызывает deleteCategory при подтверждении удаления', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Подписки')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /удалить/i }));

    await waitFor(() => {
      expect(screen.getByText(/Удалить категорию «Подписки»/i)).toBeInTheDocument();
    });

    const dialog = screen
      .getAllByRole('button', { name: /^удалить$/i })
      .find(btn => btn.className.includes('bg-expense-500'));
    await user.click(dialog!);

    await waitFor(() => {
      expect(mockDeleteCategory).toHaveBeenCalledWith('c3', undefined);
    });
  });

  it('закрывает диалог при отмене', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Подписки')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /удалить/i }));

    await waitFor(() => {
      expect(screen.getByText(/Удалить категорию «Подписки»/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /отмена/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Удалить категорию «Подписки»/i)).not.toBeInTheDocument();
    });

    expect(mockDeleteCategory).not.toHaveBeenCalled();
  });
});

describe('CategoriesPage — удаление категории с транзакциями', () => {
  beforeEach(() => {
    mockFetchTransactions.mockImplementation((params?: { category_id?: string }) => {
      if (params?.category_id === 'c3') {
        return Promise.resolve([
          {
            id: 't1',
            user_id: 'u1',
            category_id: 'c3',
            amount: 500,
            type: 'expense' as TransactionType,
            comment: 'Netflix',
            transaction_date: '2024-06-01',
            created_at: '',
            updated_at: '',
            categories: {
              id: 'c3',
              name: 'Подписки',
              type: 'expense' as TransactionType,
              color: '#8b5cf6',
            },
          },
          {
            id: 't2',
            user_id: 'u1',
            category_id: 'c3',
            amount: 300,
            type: 'expense' as TransactionType,
            comment: 'Spotify',
            transaction_date: '2024-06-02',
            created_at: '',
            updated_at: '',
            categories: {
              id: 'c3',
              name: 'Подписки',
              type: 'expense' as TransactionType,
              color: '#8b5cf6',
            },
          },
        ] as Transaction[]);
      }
      return Promise.resolve([] as Transaction[]);
    });
  });

  it('предлагает перенос или удаление транзакций', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Подписки')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /удалить/i }));

    await waitFor(() => {
      expect(screen.getByText(/перенести в другую категорию/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/удалить вместе с транзакциями/i)).toBeInTheDocument();
    expect(screen.getByText(/2 транзакций будут безвозвратно удалены/i)).toBeInTheDocument();
  });

  it('вызывает deleteCategory без reassign_to при удалении с транзакциями', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Подписки')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /удалить/i }));

    await waitFor(() => {
      expect(screen.getByText(/удалить вместе с транзакциями/i)).toBeInTheDocument();
    });

    await user.click(screen.getByText(/удалить вместе с транзакциями/i));

    await waitFor(() => {
      expect(mockDeleteCategory).toHaveBeenCalledWith('c3', undefined);
    });
  });

  it('вызывает deleteCategory с reassign_to при переносе транзакций', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Подписки')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /удалить/i }));

    await waitFor(() => {
      expect(screen.getByText(/перенести в другую категорию/i)).toBeInTheDocument();
    });

    await user.click(screen.getByText(/перенести в другую категорию/i));

    await waitFor(() => {
      expect(screen.getByText(/выберите категорию для переноса/i)).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'c1');

    await user.click(screen.getByRole('button', { name: /перенести и удалить/i }));

    await waitFor(() => {
      expect(mockDeleteCategory).toHaveBeenCalledWith('c3', 'c1');
    });
  });

  it('показывает только категории того же типа для переноса', async () => {
    renderWithProviders(<CategoriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Подписки')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /удалить/i }));

    await waitFor(() => {
      expect(screen.getByText(/перенести в другую категорию/i)).toBeInTheDocument();
    });

    await user.click(screen.getByText(/перенести в другую категорию/i));

    await waitFor(() => {
      expect(screen.getByText(/выберите категорию для переноса/i)).toBeInTheDocument();
    });

    const options = screen.getAllByRole('option');
    const optionTexts = options.map(o => o.textContent);
    expect(optionTexts).toContain('Еда');
    expect(optionTexts).toContain('Транспорт');
    expect(optionTexts).not.toContain('Зарплата');
  });
});
