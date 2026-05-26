import { useState } from 'react';
import type { Transaction, TransactionType } from '../utils/types';
import { useUpdateTransaction, useCategories } from '../api/hooks';
import CategorySelect from './CategorySelect';

interface EditTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export default function EditTransactionModal({ transaction, onClose }: EditTransactionModalProps) {
  const { data: categories = [] } = useCategories();
  const updateMut = useUpdateTransaction();

  const [type, setType] = useState<TransactionType>(transaction.type);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [categoryId, setCategoryId] = useState(transaction.category_id);
  const [comment, setComment] = useState(transaction.comment);
  const [date, setDate] = useState(transaction.transaction_date);
  const [error, setError] = useState<string | null>(null);

  const currentCategories = categories.filter(c => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!amount || Number(amount) <= 0) {
      setError('Введите корректную сумму');
      return;
    }
    if (!date) {
      setError('Выберите дату');
      return;
    }

    try {
      await updateMut.mutateAsync({
        id: transaction.id,
        data: {
          type,
          amount,
          category_id: categoryId,
          comment: comment.trim(),
          transaction_date: date,
        },
      });
      onClose();
    } catch {
      setError('Ошибка при сохранении');
    }
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const catsOfType = categories.filter(c => c.type === newType);
    setCategoryId(catsOfType[0]?.id ?? '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-5">Редактировать операцию</h3>

        {error && (
          <div className="bg-expense-50 text-expense-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
                type === 'expense'
                  ? 'bg-expense-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Расход
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
                type === 'income'
                  ? 'bg-income-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Доход
            </button>
          </div>

          <div className="space-y-1">
            <label htmlFor="edit-amount" className="block text-sm font-medium text-gray-700">
              Сумма (₽)
            </label>
            <input
              id="edit-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <CategorySelect
            categories={currentCategories}
            value={categoryId}
            onChange={setCategoryId}
          />

          <div className="space-y-1">
            <label htmlFor="edit-comment" className="block text-sm font-medium text-gray-700">
              Комментарий
            </label>
            <input
              id="edit-comment"
              type="text"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Описание операции"
              maxLength={500}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700">
              Дата
            </label>
            <input
              id="edit-date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={updateMut.isPending}
              className="px-4 py-2.5 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50"
            >
              {updateMut.isPending ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
