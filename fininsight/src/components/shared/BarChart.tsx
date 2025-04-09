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
    <div className="w-full h-64 z-0">
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={"day"} 
            hide={true}
            label={{ 
              value: "Day of Week", 
              position: "insideBottom", 
              offset: -5 
            }} 
          />
          <YAxis 
            label={{ 
              value: "Amount ($)", 
              angle: -90, 
              position: "insideLeft"
            }} 
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" fill="#82ca9d" name="Income" />
          <Bar dataKey="expense" fill="#ff6b6b" name="Expense" />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
