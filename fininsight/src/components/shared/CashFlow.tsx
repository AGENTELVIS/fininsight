import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useUserContext } from '@/context/AuthContext';
import { getCashFlow, TimeRange } from '@/lib/appwrite/api';
import { formatCurrency } from '@/lib/utils';

type CashFlowProps = {
  range: TimeRange;
};

const CashFlow = ({ range }: CashFlowProps) => {
  const { user } = useUserContext();
  const [cashFlow, setCashFlow] = useState({
    income: 0,
    expense: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCashFlow = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const data = await getCashFlow(user.id, range);
        setCashFlow(data);
      } catch (error) {
        console.error('Error fetching cash flow:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCashFlow();
  }, [user?.id, range]);

  return (
    <div className="pt-6 pl-2 pr-2 pb-6 border rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold pl-3">Cash Flow</h2>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
            <span className="text-green-700 font-medium">Income</span>
            <span className="text-green-700 font-bold">
              {formatCurrency(cashFlow.income)}
            </span>
          </div>

          <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
            <span className="text-red-700 font-medium">Expense</span>
            <span className="text-red-700 font-bold">
              {formatCurrency(cashFlow.expense)}
            </span>
          </div>

          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
            <span className="text-blue-700 font-medium">Total</span>
            <span className={`font-bold ${
              cashFlow.total >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              {formatCurrency(cashFlow.total)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashFlow; 