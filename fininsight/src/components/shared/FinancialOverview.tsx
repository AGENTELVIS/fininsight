import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import CashFlow from './CashFlow';
import CategoryPieChart from './CategoryPieChart';
import BarChart from './BarChart';
import LineChart from './LineChart';
import { TimeRange } from '@/lib/appwrite/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserContext } from '@/context/AuthContext';
import { getCurrentMonthTransactions, groupTransactionsByDay, groupTransactionsByMonth } from '@/lib/appwrite/api';

const FinancialOverview = () => {
  const { user } = useUserContext();
  const [range, setRange] = useState<TimeRange>('month');
  const [showIncome, setShowIncome] = useState(false);
  const [view, setView] = useState<'daily' | 'monthly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{ day: string; income: number; expense: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const transactions = await getCurrentMonthTransactions(user.id);
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
        console.error('Error fetching transaction data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, view]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Financial Overview</h2>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded ${
                range === r ? 'bg-blue-600 text-white' : 'bg-gray-200'
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

      {/* Transaction Charts */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Transaction Overview</h2>
          <div className="flex gap-2">
            {['daily', 'monthly'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v as 'daily' | 'monthly')}
                className={`px-4 py-2 rounded ${
                  view === v ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
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