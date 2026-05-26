import type { Category } from '../utils/types';

interface CategorySelectProps {
  categories: Category[];
  value: string;
  onChange: (value: string) => void;
}

export default function CategorySelect({ categories, value, onChange }: CategorySelectProps) {
  return (
    <div className="space-y-1">
      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
        Категория
      </label>
      <select
        id="category"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      >
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}
