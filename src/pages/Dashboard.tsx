import { useState, useMemo } from 'react';
import type { FilterState, Transaction } from '../utils/types';
import { useTransactions, useCategories, useDeleteTransaction } from '../api/hooks';
import TransactionList from '../components/TransactionList';
import EditTransactionModal from '../components/EditTransactionModal';
import {
  calculateBalance,
  calculateTotalByType,
  filterTransactions,
  groupCategoriesByType,
} from '../utils/helpers';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 20;

export default function Dashboard() {
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    category: 'all',
    type: 'all',
  });
  const [page, setPage] = useState(1);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const { data: transactions = [], isLoading, error } = useTransactions();
  const { data: categories = [] } = useCategories();
  const deleteMut = useDeleteTransaction();

  function handleDelete(id: string) {
    deleteMut.mutate(id);
  }

  const filtered = useMemo(
    () => filterTransactions(transactions, filters),
    [transactions, filters]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const balance = calculateBalance(transactions);
  const totalIncome = calculateTotalByType(transactions, 'income');
  const totalExpense = calculateTotalByType(transactions, 'expense');

  const grouped = groupCategoriesByType(categories);
  const allCategories = [
    { value: 'all', label: 'Все категории' },
    ...grouped.expense.map(c => ({ value: c.id, label: `${c.name}` })),
    ...grouped.income.map(c => ({ value: c.id, label: `${c.name}` })),
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-50">
          <p className="text-sm text-gray-500 mb-1">Баланс</p>
          <p
            className={`text-2xl font-bold ${balance >= 0 ? 'text-income-600' : 'text-expense-600'}`}
          >
            {new Intl.NumberFormat('ru-RU').format(balance)} ₽
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-50">
          <p className="text-sm text-gray-500 mb-1">Доходы</p>
          <p className="text-2xl font-bold text-income-600">
            +{new Intl.NumberFormat('ru-RU').format(totalIncome)} ₽
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-50">
          <p className="text-sm text-gray-500 mb-1">Расходы</p>
          <p className="text-2xl font-bold text-expense-600">
            -{new Intl.NumberFormat('ru-RU').format(totalExpense)} ₽
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Тип</label>
            <select
              value={filters.type}
              onChange={e =>
                setFilters(prev => ({ ...prev, type: e.target.value as FilterState['type'] }))
              }
              className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
            >
              <option value="all">Все</option>
              <option value="income">Доходы</option>
              <option value="expense">Расходы</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Категория</label>
            <select
              value={filters.category}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  category: e.target.value as FilterState['category'],
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
            >
              {allCategories.map(c => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">С</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={e => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">По</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={e => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="text-gray-400 mt-3 text-sm">Загрузка...</p>
        </div>
      ) : error ? (
        <div className="bg-expense-50 text-expense-700 px-4 py-3 rounded-lg text-sm">
          Не удалось загрузить транзакции
        </div>
      ) : (
        <>
          <TransactionList
            transactions={paged}
            onDelete={handleDelete}
            onEdit={tx => setEditingTx(tx)}
          />
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Назад
              </button>
              <span className="text-sm text-gray-500">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Вперёд
              </button>
            </div>
          )}
        </>
      )}

      {editingTx && (
        <EditTransactionModal transaction={editingTx} onClose={() => setEditingTx(null)} />
      )}

      <Link
        to="/add"
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-colors no-underline"
      >
        +
      </Link>
    </div>
  );
}
