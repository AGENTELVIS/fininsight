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
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingBag, 
  Utensils, 
  Home, 
  Film, 
  Receipt, 
  Plane, 
  HeartPulse, 
  GraduationCap, 
  CreditCard, 
  Gift, 
  Briefcase, 
  TrendingUp, 
  Wallet, 
  RefreshCw, 
  Building2 
} from "lucide-react";

type BudgetWithSpending = Models.Document & {
  spent: number;
  percentage: number;
};

const getCategoryIcon = (category: string) => {
  const iconSize = "h-4 w-4";
  const iconClass = "text-gray-500";

  switch (category) {
    case "shopping":
      return <ShoppingBag className={`${iconSize} ${iconClass}`} />;
    case "food":
      return <Utensils className={`${iconSize} ${iconClass}`} />;
    case "home":
      return <Home className={`${iconSize} ${iconClass}`} />;
    case "entertainment":
      return <Film className={`${iconSize} ${iconClass}`} />;
    case "bills":
      return <Receipt className={`${iconSize} ${iconClass}`} />;
    case "travel":
      return <Plane className={`${iconSize} ${iconClass}`} />;
    case "health":
      return <HeartPulse className={`${iconSize} ${iconClass}`} />;
    case "education":
      return <GraduationCap className={`${iconSize} ${iconClass}`} />;
    case "subscriptions":
      return <CreditCard className={`${iconSize} ${iconClass}`} />;
    case "other":
      return <Receipt className={`${iconSize} ${iconClass}`} />;
    default:
      return <Receipt className={`${iconSize} ${iconClass}`} />;
  }
};

const getBudgetColor = (percentage: number) => {
  if (percentage < 70) {
    return {
      progress: "bg-green-500",
      text: "text-green-600",
    };
  } else if (percentage < 90) {
    return {
      progress: "bg-orange-500",
      text: "text-orange-600",
    };
  } else {
    return {
      progress: "bg-red-500",
      text: "text-red-600",
    };
  }
};

const CreateBudget = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const { user } = useUserContext();
  const { toast } = useToast();
  const { data: budgetData, isLoading } = useGetUserBudgets(user?.id);
  const [budgetsWithSpending, setBudgetsWithSpending] = useState<BudgetWithSpending[]>([]);
  const [notifiedBudgets, setNotifiedBudgets] = useState<Set<string>>(() => {
    
    const stored = localStorage.getItem('notifiedBudgets');
    return new Set(stored ? JSON.parse(stored) : []);
  });

  const handleCreateBudget = () => {
    const currentBudgetsCount = budgetData?.documents?.length ?? 0;
    if (currentBudgetsCount >= 3) {
      toast({
        title: "Budget Limit Reached",
        description: "You can only have 3 budgets at a time. Please delete an existing budget to create a new one.",
        variant: "destructive",
      });
      return;
    }
    setOpenDrawer(true);
  };

  useEffect(() => {
    const fetchSpending = async () => {
      if (!budgetData?.documents) return;

      const updatedBudgets = budgetData.documents.map((budget) => {
        const spent = Number(budget.spent || 0);
        const percentage = Math.min((spent / budget.amount) * 100, 100);
      
        
        if (percentage >= 80 && !notifiedBudgets.has(budget.$id)) {
          toast({
            title: "Budget Alert",
            description: `Your ${budget.category} budget has reached ${Math.round(percentage)}% of its limit.`,
            variant: "destructive",
          });
          const newNotifiedBudgets = new Set(notifiedBudgets).add(budget.$id);
          setNotifiedBudgets(newNotifiedBudgets);
          
          localStorage.setItem('notifiedBudgets', JSON.stringify([...newNotifiedBudgets]));
        }
      
        return {
          ...budget,
          spent,
          percentage,
        };
      });

      setBudgetsWithSpending(updatedBudgets);
    };

    fetchSpending();
  }, [budgetData, user.id, toast, notifiedBudgets]);

  return (
    <div className="bg-slate-50 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Budgets</h2>
        <Button 
          onClick={handleCreateBudget}
          className="w-8 h-8 p-0 rounded-full border-2 flex items-center justify-center"
        >
          +
        </Button>
      </div>
      
      <div className="max-h-[300px] overflow-y-auto space-y-3">
        {isLoading ? (
          
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
          budgetsWithSpending.map((budget) => {
            const { progress: progressColor, text: textColor } = getBudgetColor(budget.percentage);
            return (
              <div key={budget.$id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(budget.category)}
                    <h3 className="text-sm font-medium">{budget.category}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(budget.startDate), 'MMM d')} - {format(new Date(budget.endDate), 'MMM d')}
                  </p>
                </div>
                <Progress value={budget.percentage} indicatorColor={progressColor} className="h-1" />
                <p className={`text-xs ${textColor}`}>
                  ₹{budget.spent} / ₹{budget.amount}
                </p>
              </div>
            );
          })
        )}
      </div>
      
      <BudgetModal isOpen={openDrawer} setIsOpen={setOpenDrawer} />
    </div>
  );
};

export default CreateBudget;
