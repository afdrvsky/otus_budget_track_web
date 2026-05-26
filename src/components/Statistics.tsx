import type { Transaction } from '../utils/types';
import { groupByCategory, calculateTotalByType, calculateBalance } from '../utils/helpers';

interface StatisticsProps {
  transactions: Transaction[];
}

function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  const radius = 80;
  const cx = 100;
  const cy = 100;
  const strokeWidth = 40;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <svg viewBox="0 0 200 200" className="w-48 h-48 sm:w-56 sm:h-56 mx-auto">
      {data.map((item, i) => {
        const segmentLength = (item.value / total) * circumference;
        const offset = currentOffset;
        currentOffset += segmentLength;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={item.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            className="transition-all duration-500"
          />
        );
      })}
      <text x={cx} y={cy - 8} textAnchor="middle" className="text-xs fill-gray-500" fontSize="12">
        Всего
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        className="fill-gray-900 font-bold"
        fontSize="16"
      >
        {new Intl.NumberFormat('ru-RU').format(total)} ₽
      </text>
    </svg>
  );
}

export default function Statistics({ transactions }: StatisticsProps) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const incomes = transactions.filter(t => t.type === 'income');

  const totalExpenses = calculateTotalByType(transactions, 'expense');
  const totalIncomes = calculateTotalByType(transactions, 'income');
  const balance = calculateBalance(transactions);

  const expenseByCategory = groupByCategory(expenses);
  const expenseChartData = Object.entries(expenseByCategory).map(([, data]) => ({
    label: data.name,
    value: data.amount,
    color: data.color,
  }));

  const incomeByCategory = groupByCategory(incomes);
  const incomeChartData = Object.entries(incomeByCategory).map(([, data]) => ({
    label: data.name,
    value: data.amount,
    color: data.color,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
          <p className="text-sm text-gray-500">Баланс</p>
          <p
            className={`text-xl font-bold ${balance >= 0 ? 'text-income-600' : 'text-expense-600'}`}
          >
            {new Intl.NumberFormat('ru-RU').format(balance)} ₽
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
          <p className="text-sm text-gray-500">Доходы</p>
          <p className="text-xl font-bold text-income-600">
            +{new Intl.NumberFormat('ru-RU').format(totalIncomes)} ₽
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
          <p className="text-sm text-gray-500">Расходы</p>
          <p className="text-xl font-bold text-expense-600">
            -{new Intl.NumberFormat('ru-RU').format(totalExpenses)} ₽
          </p>
        </div>
      </div>

      {expenseChartData.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-50">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Расходы по категориям</h3>
          <PieChart data={expenseChartData} />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {expenseChartData.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600 truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {incomeChartData.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-50">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Доходы по категориям</h3>
          <PieChart data={incomeChartData} />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {incomeChartData.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600 truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
