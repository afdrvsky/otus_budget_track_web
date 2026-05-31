import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import TransactionList from '../components/TransactionList';
import type { Transaction } from '../utils/types';

describe('TransactionList', () => {
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      user_id: 'u1',
      category_id: 'c1',
      type: 'expense',
      amount: 1500,
      comment: 'Обед в кафе',
      transaction_date: '2024-05-15',
      created_at: '2024-05-15T12:00:00Z',
      updated_at: '2024-05-15T12:00:00Z',
      categories: { id: 'c1', name: 'Еда', type: 'expense', color: '#f97316' },
    },
    {
      id: '2',
      user_id: 'u1',
      category_id: 'c2',
      type: 'income',
      amount: 50000,
      comment: 'Месячная зарплата',
      transaction_date: '2024-05-01',
      created_at: '2024-05-01T12:00:00Z',
      updated_at: '2024-05-01T12:00:00Z',
      categories: { id: 'c2', name: 'Зарплата', type: 'income', color: '#22c55e' },
    },
    {
      id: '3',
      user_id: 'u1',
      category_id: 'c3',
      type: 'expense',
      amount: 3000,
      comment: 'Такси',
      transaction_date: '2024-05-10',
      created_at: '2024-05-10T12:00:00Z',
      updated_at: '2024-05-10T12:00:00Z',
      categories: { id: 'c3', name: 'Транспорт', type: 'expense', color: '#3b82f6' },
    },
  ];

  it('отображает все транзакции', () => {
    render(<TransactionList transactions={mockTransactions} />);

    expect(screen.getByText('Обед в кафе')).toBeInTheDocument();
    expect(screen.getByText('Месячная зарплата')).toBeInTheDocument();
    expect(screen.getByText('Такси')).toBeInTheDocument();
  });

  it('показывает категории и даты', () => {
    render(<TransactionList transactions={mockTransactions} />);

    expect(screen.getByText(/еда/i)).toBeInTheDocument();
    expect(screen.getAllByText(/зарплата/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/транспорт/i)).toBeInTheDocument();
  });

  it('показывает пустое состояние при отсутствии транзакций', () => {
    render(<TransactionList transactions={[]} />);

    expect(screen.getByText(/нет транзакций/i)).toBeInTheDocument();
  });

  it('отображает кнопки удаления при передаче onDelete', () => {
    const mockDelete = jest.fn();
    render(<TransactionList transactions={mockTransactions} onDelete={mockDelete} />);

    const deleteButtons = screen.getAllByLabelText('Удалить');
    expect(deleteButtons).toHaveLength(3);
  });
});
