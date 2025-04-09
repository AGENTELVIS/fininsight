import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  data: { category: string; total: number }[];
};

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#d0ed57", "#a4de6c"];

const CategoryPieChart: React.FC<Props> = ({ data }) => {
  const totalAmount = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="w-full h-72 relative z-0">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={2}
            label
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-sm text-gray-500">Total Expense</p>
        <p className="text-xl font-bold text-red-500">₹{totalAmount}</p>
      </div>
    </div>
  );
};

export default CategoryPieChart;
