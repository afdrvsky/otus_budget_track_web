import { useState } from 'react';
import type { Category, TransactionType } from '../utils/types';
import { colorPalette, sanitizeApiError } from '../utils/helpers';

interface CategoryFormProps {
  initialData?: Category;
  type: TransactionType;
  onSubmit: (data: { name: string; color: string }) => Promise<void>;
  onCancel: () => void;
}

export default function CategoryForm({ initialData, type, onSubmit, onCancel }: CategoryFormProps) {
  const isEditing = !!initialData;
  const [name, setName] = useState(initialData?.name ?? '');
  const [color, setColor] = useState(initialData?.color ?? colorPalette[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Введите название категории');
      return;
    }
    if (trimmed.length > 30) {
      setError('Название не должно превышать 30 символов');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name: trimmed, color });
    } catch (err: unknown) {
      setError(sanitizeApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-5">
          {isEditing
            ? 'Редактировать категорию'
            : `Новая категория (${type === 'expense' ? 'расход' : 'доход'})`}
        </h3>

        {error && (
          <div className="bg-expense-50 text-expense-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label htmlFor="cat-name" className="block text-sm font-medium text-gray-700">
              Название
            </label>
            <input
              id="cat-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={30}
              placeholder="Название категории"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Цвет</label>
            <div className="flex flex-wrap gap-2">
              {colorPalette.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c
                      ? 'ring-2 ring-offset-2 ring-primary-500 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Цвет ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
