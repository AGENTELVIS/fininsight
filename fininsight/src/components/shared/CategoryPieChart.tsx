import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useUserContext } from '@/context/AuthContext';
import { getCategoryWiseData, TimeRange } from '@/lib/appwrite/api';
import { formatCurrency } from '@/lib/utils';

type CategoryPieChartProps = {
  range: TimeRange;
  type: 'income' | 'expense';
};

const COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEEAD', // Yellow
  '#D4A5A5', // Pink
  '#9B59B6', // Purple
  '#3498DB', // Light Blue
  '#E67E22', // Orange
  '#2ECC71', // Emerald
];

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ range, type }) => {
  const { user } = useUserContext();
  const [data, setData] = useState<{ category: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const categoryData = await getCategoryWiseData(user.id, range, type);
        setData(categoryData);
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, range, type]);

  const totalAmount = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="w-full h-96 relative">
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              label={({ name, percent }) => 
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`₹${value}`, 'Amount']}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}

      {/* Center Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-sm text-gray-500">Total {type === 'income' ? 'Income' : 'Expense'}</p>
        <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalAmount)}</p>
      </div>
    </div>
  );
};

export default CategoryPieChart;
