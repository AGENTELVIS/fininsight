import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import CashFlow from './CashFlow';
import CategoryPieChart from './CategoryPieChart';
import BarChart from './BarChart';
import LineChart from './LineChart';
import { TimeRange } from '@/lib/appwrite/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserContext } from '@/context/AuthContext';
import { groupTransactionsByDay, groupTransactionsByMonth } from '@/lib/appwrite/api';
import { useGetAllTransactions } from '@/lib/react-query/queriesAndMutations';

const FinancialOverview = () => {
  const { user } = useUserContext();
  const [range, setRange] = useState<TimeRange>('month');
  const [showIncome, setShowIncome] = useState(false);
  const [view, setView] = useState<'daily' | 'monthly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{ day: string; income: number; expense: number }[]>([]);

  const { data: transactions, isLoading: isTransactionsLoading } = useGetAllTransactions(user?.id);

  useEffect(() => {
    if (!transactions?.documents) return;
    
    setLoading(true);
    try {
      const formattedData = transactions.documents.map(tx => ({
        amount: tx.amount,
        date: tx.date,
        type: tx.type,
      }));

      const groupedData = view === 'daily' 
        ? groupTransactionsByDay(formattedData)
        : groupTransactionsByMonth(formattedData);

      setChartData(groupedData);
    } catch (error) {
      console.error('Error processing transaction data:', error);
    } finally {
      setLoading(false);
    }
  }, [transactions, view]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Financial Overview</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>View by:</span>
          {(['week', 'month', 'year'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-1 rounded-md transition-colors ${
                range === r ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CashFlow range={range} />
        
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 
              className="text-xl font-semibold cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setShowIncome(!showIncome)}
            >
              {showIncome ? 'Income Categories' : 'Expense Categories'}
            </h2>
          </div>
          <CategoryPieChart 
            range={range} 
            type={showIncome ? 'income' : 'expense'} 
          />
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Transaction Overview</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>View by:</span>
            {['daily', 'monthly'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v as 'daily' | 'monthly')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  view === v ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {isTransactionsLoading || loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No transaction data available for the selected period
          </div>
        ) : view === 'daily' ? (
          <BarChart data={chartData} />
        ) : (
          <LineChart data={chartData} />
        )}
      </Card>
    </div>
  );
};

export default FinancialOverview; 