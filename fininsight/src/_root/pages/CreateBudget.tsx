import { useEffect, useState } from "react";
import { Models } from "appwrite";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/Progress";
import BudgetModal from "@/components/shared/BudgetCard";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserBudgets } from "@/lib/react-query/queriesAndMutations";
import { getTotalSpentForCategory } from "@/lib/appwrite/api"; // make sure this is exported

type BudgetWithSpending = Models.Document & {
  spent: number;
  percentage: number;
};

const BudgetCard = () => {
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
    <div className="p-4 space-y-6">
      <Button onClick={() => setOpenDrawer(true)}>+ Add Budget</Button>
      

      {!isLoading && budgetsWithSpending.map((budget) => (
        <div key={budget.$id} className="bg-white rounded shadow p-4 space-y-2">
          <h3 className="text-lg font-semibold">{budget.category}</h3>
          <Progress value={budget.percentage} />
          <p className="text-sm text-muted-foreground">
            ₹{budget.spent} / ₹{budget.amount} spent
          </p>
        </div>
      ))}
      <BudgetModal isOpen={openDrawer} setIsOpen={setOpenDrawer} />
    </div>
  );
};

export default BudgetCard;
