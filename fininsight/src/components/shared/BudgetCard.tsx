import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import DatePicker from "../shared/DatePicker";
import IntervalDropdown from "../shared/IntervalDropdown";
import CategoryDropdown from "@/components/forms/CategoryDropdown";
import { BudgetValidation } from "@/lib/validation";
import { useUserContext } from "@/context/AuthContext";
import { useCreateBudget, useGetUserBudgets, useUpdateBudget } from "@/lib/react-query/queriesAndMutations";
import { Query_Keys } from "@/lib/react-query/queryKeys";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import Modal from "@/_root/pages/UpdateTransactions";
import { Models } from "appwrite";
import { calculateEndDate } from "@/lib/appwrite/api";

type BudgetModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  budget?: Models.Document;
};

const BudgetModal = ({ isOpen, setIsOpen, budget }: BudgetModalProps) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutateAsync: createBudget } = useCreateBudget();
  const { mutateAsync: updateBudget } = useUpdateBudget();
  const { data: existingBudgets } = useGetUserBudgets(user?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof BudgetValidation>>({
    resolver: zodResolver(BudgetValidation),
    defaultValues: {
      amount: 0,
      category: "",
      period: "Monthly",
      periodNumber: 1,
      startDate: new Date(),
    },
  });

  
  useEffect(() => {
    if (budget) {
      form.reset({
        amount: Number(budget.amount),
        category: budget.category,
        period: budget.period,
        periodNumber: Number(budget.periodNumber),
        startDate: new Date(budget.startDate),
      });
    } else {
      form.reset({
        amount: 0,
        category: "",
        period: "Monthly",
        periodNumber: 1,
        startDate: new Date(),
      });
    }
  }, [budget]);

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const validateBudgetDates = (startDate: Date | undefined, period: string, periodNumber: number) => {
    if (!startDate) {
      toast({
        title: "Invalid Start Date",
        description: "Please select a start date for your budget.",
        variant: "destructive",
      });
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = calculateEndDate(start, period, periodNumber);
    end.setHours(0, 0, 0, 0);

    
    if (today < start || today > end) {
      toast({
        title: "Invalid Budget Period",
        description: "Budget must include today's date. Please adjust the start date or period.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };


  const onSubmit = async (values: z.infer<typeof BudgetValidation>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
     
      if (!budget) {
        const currentBudgetsCount = existingBudgets?.documents?.length ?? 0;
        if (currentBudgetsCount >= 3) {
          toast({
            title: "Budget Limit Reached",
            description: "You can only have 3 budgets at a time. Please delete an existing budget to create a new one.",
            variant: "destructive",
          });
          setIsOpen(false);
          return;
        }

       
        const existingCategoryBudget = existingBudgets?.documents?.find(
          (b) => b.category === values.category
        );

        if (existingCategoryBudget) {
          toast({
            title: "Category Already Budgeted",
            description: `You already have a budget for ${values.category}. Please choose a different category or edit the existing budget.`,
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

     
      if (!validateBudgetDates(values.startDate, values.period, values.periodNumber)) {
        setIsSubmitting(false);
        return;
      }

      if (budget) {
        
        await updateBudget({
          budgetId: budget.$id,
          updatedData: {
            ...values,
            creator: user.id,
          },
        });
        toast({
          title: "Budget updated successfully!",
        });
      } else {
       
        const newBudget = await createBudget({
          ...values,
          creator: user.id,
        });

        if (!newBudget) {
          toast({
            title: "Failed to create budget. Please try again.",
          });
          return;
        }

        toast({
          title: "Budget created successfully!",
        });
      }

      queryClient.invalidateQueries([Query_Keys.GET_USER_BUDGETS]);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to save budget. Please try again.",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentBudgetsCount = existingBudgets?.documents?.length ?? 0;
  const isBudgetLimitReached = !budget && currentBudgetsCount >= 3;

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">{budget ? 'Edit Budget' : 'Create Budget'}</h2>
        {isBudgetLimitReached && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            <p className="text-sm">You have reached the maximum limit of 3 budgets. Please delete an existing budget to create a new one.</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <CategoryDropdown value={field.value} onChange={field.onChange} 
                    type="expense"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeat Every</FormLabel>
                  <FormControl>
                    <IntervalDropdown {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="periodNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeat Interval</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <DatePicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isBudgetLimitReached}
              >
                {isSubmitting ? "Saving..." : budget ? "Update Budget" : "Save Budget"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
};

export default BudgetModal;
