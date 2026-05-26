import type { Transaction } from '../utils/types';
import { formatAmount, formatDate, getCategoryName, getCategoryColor } from '../utils/helpers';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
  onEdit?: (transaction: Transaction) => void;
}

export default function TransactionList({ transactions, onDelete, onEdit }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">Нет транзакций</p>
        <p className="text-gray-400 text-sm mt-1">Добавьте первую операцию</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map(transaction => (
        <div
          key={transaction.id}
          className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-50 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: getCategoryColor(transaction) }}
            >
              {getCategoryName(transaction).charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {transaction.comment || getCategoryName(transaction)}
              </p>
              <p className="text-xs text-gray-500">
                {getCategoryName(transaction)} · {formatDate(transaction.transaction_date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-sm font-semibold ${
                transaction.type === 'income' ? 'text-income-600' : 'text-expense-600'
              }`}
            >
              {formatAmount(transaction.amount, transaction.type)}
            </span>
            {onEdit && (
              <button
                onClick={() => onEdit(transaction)}
                className="text-gray-300 hover:text-primary-500 transition-colors p-1"
                aria-label="Редактировать"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(transaction.id)}
                className="text-gray-300 hover:text-expense-500 transition-colors p-1"
                aria-label="Удалить"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
