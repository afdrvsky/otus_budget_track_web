import type { TransactionFormData } from '../utils/types';
import { useCreateTransaction } from '../api/hooks';
import AddTransactionForm from '../components/AddTransactionForm';
import { useNavigate } from 'react-router-dom';

export default function AddTransaction() {
  const navigate = useNavigate();
  const createMut = useCreateTransaction();

  const handleSubmit = async (data: TransactionFormData) => {
    await createMut.mutateAsync(data);
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Новая операция</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-50">
        <AddTransactionForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
