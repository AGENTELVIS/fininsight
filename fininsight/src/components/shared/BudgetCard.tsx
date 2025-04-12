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
import { useCreateBudget, useGetUserBudgets } from "@/lib/react-query/queriesAndMutations";
import { Query_Keys } from "@/lib/react-query/queryKeys";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import Modal from "@/_root/pages/UpdateTransactions";

type BudgetModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const BudgetModal = ({ isOpen, setIsOpen }: BudgetModalProps) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutateAsync: createBudget, isLoading: isLoadingCreate } = useCreateBudget();
  const { data: existingBudgets } = useGetUserBudgets(user?.id);

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
    if (!isOpen) form.reset();
  }, [isOpen]);

  const onSubmit = async (values: z.infer<typeof BudgetValidation>) => {
    try {
      // Check if user already has 3 budgets
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

      const newBudget = await createBudget({
        ...values,
        userID: user.id,
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
      queryClient.invalidateQueries([Query_Keys.GET_USER_BUDGETS]);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to create budget. Please try again.",
      });
    }
  };

  const currentBudgetsCount = existingBudgets?.documents?.length ?? 0;
  const isBudgetLimitReached = currentBudgetsCount >= 3;

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Create Budget</h2>
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
                disabled={isLoadingCreate || isBudgetLimitReached}
              >
                {isLoadingCreate ? "Creating..." : "Save Budget"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
};

export default BudgetModal;
