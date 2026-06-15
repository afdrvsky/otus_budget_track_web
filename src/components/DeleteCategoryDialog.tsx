import { useState } from 'react';
import type { Category } from '../utils/types';
import { useTransactions } from '../api/hooks';

interface DeleteCategoryDialogProps {
  category: Category;
  allCategories: Category[];
  onConfirm: (category: Category, reassignTo?: string) => Promise<void>;
  onCancel: () => void;
}

export default function DeleteCategoryDialog({
  category,
  allCategories,
  onConfirm,
  onCancel,
}: DeleteCategoryDialogProps) {
  const { data: transactions = [], isLoading } = useTransactions({
    category_id: category.id,
  });
  const [mode, setMode] = useState<'choose' | 'reassign'>('choose');
  const [reassignTo, setReassignTo] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasTransactions = transactions.length > 0;
  const sameTypeCategories = allCategories.filter(
    c => c.type === category.type && c.id !== category.id
  );

  async function handleDelete() {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(category);
    } catch {
      setError('Не удалось удалить категорию');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReassign() {
    if (!reassignTo) {
      setError('Выберите категорию для переноса');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(category, reassignTo);
    } catch {
      setError('Не удалось перенести транзакции');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="text-gray-500 mt-3 text-sm">Проверка транзакций...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Удалить категорию «{category.name}»?
        </h3>

        {error && (
          <div className="bg-expense-50 text-expense-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {!hasTransactions ? (
          <>
            <p className="text-sm text-gray-600 mb-6">
              Категория не содержит транзакций и будет удалена безвозвратно.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-expense-500 hover:bg-expense-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </>
        ) : mode === 'choose' ? (
          <>
            <p className="text-sm text-gray-600 mb-2">
              В категории есть транзакции:{' '}
              <span className="font-semibold">{transactions.length}</span> шт. Выберите действие:
            </p>
            <div className="space-y-3 mt-4">
              <button
                onClick={() => setMode('reassign')}
                disabled={sameTypeCategories.length === 0}
                className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-sm font-medium text-gray-900">
                  Перенести в другую категорию
                </span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  Транзакции будут привязаны к выбранной категории
                </span>
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-expense-300 hover:bg-expense-50 transition-colors disabled:opacity-50"
              >
                <span className="text-sm font-medium text-expense-700">
                  Удалить вместе с транзакциями
                </span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  Все {transactions.length} транзакций будут безвозвратно удалены
                </span>
              </button>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Отмена
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Выберите категорию для переноса {transactions.length} транзакций:
            </p>
            <select
              value={reassignTo}
              onChange={e => setReassignTo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">— Выбрать категорию —</option>
              {sameTypeCategories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="flex gap-3 justify-end mt-5">
              <button
                onClick={() => setMode('choose')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Назад
              </button>
              <button
                onClick={handleReassign}
                disabled={submitting || !reassignTo}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? 'Перенос...' : 'Перенести и удалить'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
