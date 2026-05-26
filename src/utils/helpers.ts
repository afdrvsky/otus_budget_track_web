import type { Category, Transaction, TransactionType } from './types';

export const colorPalette = [
  '#f97316',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f43f5e',
  '#6366f1',
  '#64748b',
  '#22c55e',
  '#06b6d4',
  '#eab308',
  '#a855f7',
];

// Group categories by type
export function groupCategoriesByType(categories: Category[]): {
  expense: Category[];
  income: Category[];
} {
  return {
    expense: categories.filter(c => c.type === 'expense'),
    income: categories.filter(c => c.type === 'income'),
  };
}

// Find category by id
export function getCategoryById(categories: Category[], id: string): Category | undefined {
  return categories.find(c => c.id === id);
}

// Get category name from transaction's joined category data
export function getCategoryName(transaction: Transaction): string {
  return transaction.categories?.name ?? 'Без категории';
}

// Get category color from transaction's joined category data
export function getCategoryColor(transaction: Transaction): string {
  return transaction.categories?.color ?? '#64748b';
}

// Format amount with currency
export function formatAmount(amount: number, type: TransactionType): string {
  const formatted = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return type === 'income' ? `+${formatted}` : `-${formatted}`;
}

// Format date to local format
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString));
}

// Calculate balance
export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce(
    (balance, t) => (t.type === 'income' ? balance + t.amount : balance - t.amount),
    0
  );
}

// Calculate total by type
export function calculateTotalByType(transactions: Transaction[], type: TransactionType): number {
  return transactions.filter(t => t.type === type).reduce((sum, t) => sum + t.amount, 0);
}

// Group amounts by category
export function groupByCategory(
  transactions: Transaction[]
): Record<string, { amount: number; type: TransactionType; name: string; color: string }> {
  return transactions.reduce(
    (groups, t) => {
      const key = t.category_id;
      if (!groups[key]) {
        groups[key] = {
          amount: 0,
          type: t.type,
          name: t.categories?.name ?? 'Без категории',
          color: t.categories?.color ?? '#64748b',
        };
      }
      groups[key].amount += t.amount;
      return groups;
    },
    {} as Record<string, { amount: number; type: TransactionType; name: string; color: string }>
  );
}

// Filter transactions
export function filterTransactions(
  transactions: Transaction[],
  filters: {
    dateFrom?: string;
    dateTo?: string;
    category?: string;
    type?: string;
  }
): Transaction[] {
  return transactions.filter(t => {
    if (filters.type && filters.type !== 'all' && t.type !== filters.type) return false;
    if (filters.category && filters.category !== 'all' && t.category_id !== filters.category)
      return false;
    if (filters.dateFrom && t.transaction_date < filters.dateFrom) return false;
    if (filters.dateTo && t.transaction_date > filters.dateTo) return false;
    return true;
  });
}
