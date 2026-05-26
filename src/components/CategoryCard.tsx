import type { Category } from '../utils/types';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export default function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ backgroundColor: category.color }}
        >
          {category.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{category.name}</p>
          <p className="text-xs text-gray-500 capitalize">
            {category.type === 'expense' ? 'Расход' : 'Доход'}
            {category.is_default ? ' · По умолчанию' : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onEdit(category)}
          className="px-3 py-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
        >
          Редактировать
        </button>
        <button
          onClick={() => onDelete(category)}
          className="px-3 py-1.5 text-xs font-medium text-expense-600 hover:text-expense-700 bg-expense-50 hover:bg-expense-100 rounded-lg transition-colors"
        >
          Удалить
        </button>
      </div>
    </div>
  );
}
