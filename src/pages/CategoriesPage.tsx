import { useState } from 'react';
import type { Category, TransactionType } from '../utils/types';
import { useCategories, useAddCategory, useUpdateCategory, useDeleteCategory } from '../api/hooks';
import CategoryCard from '../components/CategoryCard';
import CategoryForm from '../components/CategoryForm';
import ConfirmDialog from '../components/ConfirmDialog';

export default function CategoriesPage() {
  const { data: categories = [], isLoading, error: loadError } = useCategories();
  const addMut = useAddCategory();
  const updateMut = useUpdateCategory();
  const deleteMut = useDeleteCategory();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formType, setFormType] = useState<TransactionType>('expense');

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');

  function handleAddClick(type: TransactionType) {
    setFormType(type);
    setEditingCategory(null);
    setShowForm(true);
  }

  function handleEditClick(category: Category) {
    setFormType(category.type);
    setEditingCategory(category);
    setShowForm(true);
  }

  async function handleFormSubmit(data: { name: string; color: string }) {
    setError(null);
    try {
      if (editingCategory) {
        await updateMut.mutateAsync({ id: editingCategory.id, updates: data });
      } else {
        await addMut.mutateAsync({ name: data.name, type: formType, color: data.color });
      }
      setShowForm(false);
      setEditingCategory(null);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Ошибка при сохранении';
      setError(msg);
    }
  }

  function handleDeleteClick(category: Category) {
    setDeleteTarget(category);
    setConfirmDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setError(null);
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      setConfirmDeleteOpen(false);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Ошибка при удалении';
      setError(msg);
      setConfirmDeleteOpen(false);
      setDeleteTarget(null);
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        <p className="text-gray-400 mt-3 text-sm">Загрузка категорий...</p>
      </div>
    );
  }

  const displayError = error || (loadError ? 'Не удалось загрузить категории' : null);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-gray-900">Категории</h1>

      {displayError && (
        <div className="bg-expense-50 text-expense-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{displayError}</span>
          <button
            onClick={() => setError(null)}
            className="text-expense-500 hover:text-expense-700 font-medium"
          >
            ✕
          </button>
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Расходы</h2>
          <button
            onClick={() => handleAddClick('expense')}
            className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
          >
            + Добавить
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {expenseCategories.map(cat => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onEdit={() => handleEditClick(cat)}
              onDelete={() => handleDeleteClick(cat)}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Доходы</h2>
          <button
            onClick={() => handleAddClick('income')}
            className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
          >
            + Добавить
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {incomeCategories.map(cat => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onEdit={() => handleEditClick(cat)}
              onDelete={() => handleDeleteClick(cat)}
            />
          ))}
        </div>
      </section>

      {showForm && (
        <CategoryForm
          initialData={editingCategory ?? undefined}
          type={formType}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
        />
      )}

      {deleteTarget && confirmDeleteOpen && (
        <ConfirmDialog
          open={true}
          title="Удалить категорию"
          message={`Удалить категорию «${deleteTarget.name}»? Если к ней привязаны транзакции, удаление будет невозможно.`}
          confirmLabel="Удалить"
          cancelLabel="Отмена"
          variant="danger"
          onConfirm={confirmDelete}
          onCancel={() => {
            setConfirmDeleteOpen(false);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}
