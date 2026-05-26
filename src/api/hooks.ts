import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TransactionFormData, TransactionType } from '../utils/types';
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from '../api/api';

export const transactionKeys = {
  all: ['transactions'] as const,
  filtered: (filters?: TransactionQuery) => ['transactions', filters] as const,
};

export const categoryKeys = {
  all: ['categories'] as const,
  filtered: (type?: TransactionType) => ['categories', type] as const,
};

interface TransactionQuery {
  type?: TransactionType;
  category_id?: string;
  date_from?: string;
  date_to?: string;
}

export function useTransactions(filters?: TransactionQuery) {
  return useQuery({
    queryKey: transactionKeys.filtered(filters),
    queryFn: () => fetchTransactions(filters),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TransactionFormData) => createTransaction(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TransactionFormData> }) =>
      updateTransaction(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}

export function useCategories(type?: TransactionType) {
  return useQuery({
    queryKey: categoryKeys.filtered(type),
    queryFn: () => fetchCategories(type),
  });
}

export function useAddCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, type, color }: { name: string; type: TransactionType; color: string }) =>
      addCategory(name, type, color),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { name?: string; color?: string } }) =>
      updateCategory(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}
