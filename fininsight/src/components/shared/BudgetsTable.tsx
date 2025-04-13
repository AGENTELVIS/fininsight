import { Models } from 'appwrite';
import { formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/button';
import { Trash, Edit } from 'lucide-react';
import { useUpdateBudget, useDeleteBudget } from '@/lib/react-query/queriesAndMutations';
import { useQueryClient } from '@tanstack/react-query';
import { Query_Keys } from '@/lib/react-query/queryKeys';
import { useState } from 'react';
import BudgetModal from './BudgetCard';
import { format } from 'date-fns';

type BudgetsTableProps = {
  budgets: Models.Document[];
};

const BudgetsTable = ({ budgets }: BudgetsTableProps) => {
  const { mutateAsync: updateBudget } = useUpdateBudget();
  const { mutateAsync: deleteBudget } = useDeleteBudget();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Models.Document | null>(null);

  const getBudgetColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const handleEdit = (budget: Models.Document) => {
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  const handleDelete = async (budgetId: string) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      await deleteBudget(budgetId);
      queryClient.invalidateQueries([Query_Keys.GET_USER_BUDGETS]);
    }
  };

  const handleClose = () => {
    setSelectedBudget(null);
    setIsModalOpen(false);
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3">Category</th>
            <th scope="col" className="px-4 py-3">Budget</th>
            <th scope="col" className="px-4 py-3">Spent</th>
            <th scope="col" className="px-4 py-3">Remaining</th>
            <th scope="col" className="px-4 py-3">Progress</th>
            <th scope="col" className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {budgets.map((budget) => {
            const percentage = (budget.spent / budget.amount) * 100;
            const remaining = budget.amount - budget.spent;
            
            return (
              <tr key={budget.$id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 text-sm md:text-base">
                      {budget.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(budget.startDate), 'MMM d')} - {format(new Date(budget.endDate), 'MMM d')}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm md:text-base">
                  {formatCurrency(budget.amount)}
                </td>
                <td className="px-4 py-4 text-sm md:text-base">
                  {formatCurrency(budget.spent)}
                </td>
                <td className="px-4 py-4 text-sm md:text-base">
                  {formatCurrency(remaining)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={percentage} 
                      className="h-2 w-16 md:w-24"
                      indicatorColor={getBudgetColor(percentage)}
                    />
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      onClick={() => handleEdit(budget)} 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4 text-gray-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 hover:bg-red-50"
                      onClick={() => handleDelete(budget.$id)}
                    >
                      <Trash className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <BudgetModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
        budget={selectedBudget || undefined}
      />
    </div>
  );
};

export default BudgetsTable; 