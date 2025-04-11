import React from "react";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Props = {
  data: { day: string; income: number; expense: number }[];
};

const BarChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="day" 
            tick={{ fill: '#666' }}
            tickLine={{ stroke: '#666' }}
          />
          <YAxis 
            tick={{ fill: '#666' }}
            tickLine={{ stroke: '#666' }}
            tickFormatter={(value) => `₹${value}`}
          />
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
            verticalAlign="top" 
            height={36}
            formatter={(value) => <span className="text-sm">{value}</span>}
          />
          <Bar 
            dataKey="income" 
            fill="#4ECDC4" 
            name="Income"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="expense" 
            fill="#FF6B6B" 
            name="Expense"
            radius={[4, 4, 0, 0]}
          />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
