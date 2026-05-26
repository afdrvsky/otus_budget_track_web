import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddTransactionForm from '../components/AddTransactionForm';

// Мокаем API
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
    {
      id: 'c4',
      user_id: 'u1',
      name: 'Фриланс',
      type: 'income',
      color: '#06b6d4',
      is_default: true,
      created_at: '',
      updated_at: '',
    },
  ]),
}));

describe('AddTransactionForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (mockOnSubmit as jest.Mock).mockClear();
  });

  it('отправляет форму с корректными данными расхода', async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(<AddTransactionForm onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/сумма/i)).toBeInTheDocument();
    });

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/сумма/i), '1500');
    await user.type(screen.getByLabelText(/комментарий/i), 'Обед в кафе');
    await user.click(screen.getByRole('button', { name: /добавить расход/i }));

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'expense',
        amount: '1500',
        comment: 'Обед в кафе',
      })
    );
  });

  it('показывает ошибку при пустой сумме', async () => {
    render(<AddTransactionForm onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/комментарий/i)).toBeInTheDocument();
    });

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/комментарий/i), 'Тест');
    await user.click(screen.getByRole('button', { name: /добавить расход/i }));

    expect(screen.getByText(/введите корректную сумму/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('переключается на тип дохода и отправляет', async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(<AddTransactionForm onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /доход/i })).toBeInTheDocument();
    });

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /доход/i }));
    await user.type(screen.getByLabelText(/сумма/i), '50000');
    await user.type(screen.getByLabelText(/комментарий/i), 'Зарплата');
    await user.click(screen.getByRole('button', { name: /добавить доход/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'income',
        amount: '50000',
        comment: 'Зарплата',
      })
    );
  });
});
