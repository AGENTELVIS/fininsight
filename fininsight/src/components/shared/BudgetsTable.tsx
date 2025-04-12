import { Models } from 'appwrite';
import { formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/Progress';

type BudgetsTableProps = {
  budgets: Models.Document[];
};

const BudgetsTable = ({ budgets }: BudgetsTableProps) => {
  const getBudgetColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3">Category</th>
            <th scope="col" className="px-6 py-3">Budget</th>
            <th scope="col" className="px-6 py-3">Spent</th>
            <th scope="col" className="px-6 py-3">Remaining</th>
            <th scope="col" className="px-6 py-3">Progress</th>
          </tr>
        </thead>
        <tbody>
          {budgets.map((budget) => {
            const percentage = (budget.spent / budget.amount) * 100;
            const remaining = budget.amount - budget.spent;
            
            return (
              <tr key={budget.$id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {budget.category}
                </td>
                <td className="px-6 py-4">
                  {formatCurrency(budget.amount)}
                </td>
                <td className="px-6 py-4">
                  {formatCurrency(budget.spent)}
                </td>
                <td className="px-6 py-4">
                  {formatCurrency(remaining)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={percentage} 
                      className="h-2 w-24"
                      indicatorColor={getBudgetColor(percentage)}
                    />
                    <span className="text-xs text-gray-500">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BudgetsTable; 