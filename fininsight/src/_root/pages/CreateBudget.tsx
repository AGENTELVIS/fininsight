import { useEffect, useState } from "react";
import { Models } from "appwrite";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/Progress";
import { Skeleton } from "@/components/ui/skeleton";
import BudgetModal from "@/components/shared/BudgetCard";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserBudgets } from "@/lib/react-query/queriesAndMutations";
import { getTotalSpentForCategory } from "@/lib/appwrite/api";
import { format } from "date-fns";

type BudgetWithSpending = Models.Document & {
  spent: number;
  percentage: number;
};

const CreateBudget = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const { user } = useUserContext();
  const { data: budgetData, isLoading } = useGetUserBudgets(user?.id);
  const [budgetsWithSpending, setBudgetsWithSpending] = useState<BudgetWithSpending[]>([]);

  useEffect(() => {
    const fetchSpending = async () => {
      if (!budgetData?.documents) return;

      const updatedBudgets = await Promise.all(
        budgetData.documents.map(async (budget) => {
          const spent = await getTotalSpentForCategory(
            user.id,
            budget.category,
            budget.startDate,
            budget.endDate
          );
        
          const percentage = Math.min((spent / budget.amount) * 100, 100);
        
          return {
            ...budget,
            spent,
            percentage,
          };
        })        
      );

      setBudgetsWithSpending(updatedBudgets);
    };

    fetchSpending();
  }, [budgetData, user.id]);

  return (
    <div className="bg-slate-50 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Budgets</h2>
        <Button 
          onClick={() => setOpenDrawer(true)}
          className="w-8 h-8 p-0 rounded-full border-2 flex items-center justify-center"
        >
          +
        </Button>
      </div>
      
      <div className="max-h-[300px] overflow-y-auto space-y-3">
        {isLoading ? (
          // Loading skeletons
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-1 w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))
        ) : budgetsWithSpending.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No budgets created yet. Click the + button to create one.
          </div>
        ) : (
          budgetsWithSpending.map((budget) => (
            <div key={budget.$id} className="space-y-1">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">{budget.category}</h3>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(budget.startDate), 'MMM d')} - {format(new Date(budget.endDate), 'MMM d')}
                </p>
              </div>
              <Progress value={budget.percentage} className="h-1" />
              <p className="text-xs text-muted-foreground">
                ₹{budget.spent} / ₹{budget.amount}
              </p>
            </div>
          ))
        )}
      </div>
      
      <BudgetModal isOpen={openDrawer} setIsOpen={setOpenDrawer} />
    </div>
  );
};

export default CreateBudget;
