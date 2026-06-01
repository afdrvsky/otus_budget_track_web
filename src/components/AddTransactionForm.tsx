import { useState } from 'react';
import type { TransactionFormData, TransactionType } from '../utils/types';
import { useCategories } from '../api/hooks';
import CategorySelect from './CategorySelect';

interface AddTransactionFormProps {
  onSubmit: (data: TransactionFormData) => Promise<void>;
}

export default function AddTransactionForm({ onSubmit }: AddTransactionFormProps) {
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [comment, setComment] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentCategories = categories.filter(c => c.type === type);

  const handleInitialCategories = () => {
    if (!categoryId && categories.length > 0) {
      const expenseCats = categories.filter(c => c.type === 'expense');
      return expenseCats[0]?.id ?? '';
    }
    return categoryId;
  };

  const effectiveCategoryId = categoryId || handleInitialCategories();

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
    const trimmedComment = comment.trim();
    if (trimmedComment.length > 500) {
      setError('Комментарий не должен превышать 500 символов');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        type,
        amount,
        category_id: effectiveCategoryId,
        comment: trimmedComment,
        transaction_date: date,
      });
      setAmount('');
      setComment('');
      setError(null);
    } catch {
      setError('Ошибка при сохранении');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const catsOfType = categories.filter(c => c.type === newType);
    setCategoryId(catsOfType[0]?.id ?? '');
  };

  if (categoriesLoading) {
    return (
      <div className="text-center py-6">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-expense-50 text-expense-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

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
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Сумма (₽)
        </label>
        <input
          id="amount"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <CategorySelect
        categories={currentCategories}
        value={effectiveCategoryId}
        onChange={setCategoryId}
      />

      <div className="space-y-1">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
          Комментарий
        </label>
        <input
          id="comment"
          type="text"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Описание операции"
          maxLength={500}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Дата
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm ${
          type === 'expense'
            ? 'bg-expense-500 hover:bg-expense-600'
            : 'bg-income-500 hover:bg-income-600'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isSubmitting ? 'Сохранение...' : type === 'expense' ? 'Добавить расход' : 'Добавить доход'}
      </button>
    </form>
  );
}
