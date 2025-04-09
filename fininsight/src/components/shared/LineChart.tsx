import React from "react";
import {
  LineChart as ReLineChart,
  Line,
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

const LineChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="w-full h-64 z-0 relative">
      
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" type="category"/>
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="income" stroke="#82ca4d" name="Income" />
          <Line type="monotone" dataKey="expense" stroke="#ff6b6b" name="Expense" />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;

