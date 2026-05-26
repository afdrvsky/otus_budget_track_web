import { useTransactions } from '../api/hooks';
import Statistics from '../components/Statistics';

export default function StatisticsPage() {
  const { data: transactions = [], isLoading, error } = useTransactions();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        <p className="text-gray-400 mt-3 text-sm">Загрузка статистики...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-expense-50 text-expense-700 px-4 py-3 rounded-lg text-sm">
        Не удалось загрузить данные
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Статистика</h1>
      <Statistics transactions={transactions} />
    </div>
  );
}
