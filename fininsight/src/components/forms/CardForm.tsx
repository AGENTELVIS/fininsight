import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import DatePicker from "../shared/DatePicker.tsx";
import CategoryDropdown from "./CategoryDropdown.tsx";
import { CardValidation } from "@/lib/validation/index.ts";
import { Models } from "appwrite";
import { useCreateTransaction } from "@/lib/react-query/queriesAndMutations.ts";
import { useUserContext } from "@/context/AuthContext.tsx";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import TypeToggle from "../shared/TypeToggle.tsx";
import AccountDropdown from "../shared/AccountDropdown.tsx";
import { Query_Keys } from "@/lib/react-query/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "../ui/switch";
import IntervalDropdown from "../shared/IntervalDropdown.tsx";
import { useState } from "react";
import { updateTransaction } from "@/lib/appwrite/api.ts";

type CardFormProps = {
  transaction?: Models.Document;
  onClose?: () => void;
};

const CardForm = ({ transaction, onClose }: CardFormProps) => {
  const { mutateAsync: createTransaction, isLoading: isLoadingCreate } = useCreateTransaction();
  const [isRecurring, setIsRecurring] = useState(transaction?.isRecurring || false);
  const [dateError, setDateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  

  // 1. Define your form.
  const form = useForm<z.infer<typeof CardValidation>>({
    resolver: zodResolver(CardValidation),
    defaultValues: {
    amount: transaction?.amount || 0,
    category: transaction?.category || "",
    note: transaction?.note || "",
    date: transaction?.date ? new Date(transaction.date) : new Date(),
    type: transaction?.type || "expense",
    account: transaction?.account || "",
    isRecurring: transaction?.isRecurring || false,
    interval: transaction?.interval || "",
    enddate: transaction?.enddate ? new Date(transaction.enddate) : undefined,
  },
  mode: "onChange",
  });

  console.log("Form Errors:", form.formState.errors);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof CardValidation>) {
    if (Object.keys(form.formState.errors).length > 0) return;

    if (isSubmitting) return; // prevent double submit
    setIsSubmitting(true);
  
    try {
      if (transaction) {
        await updateTransaction(transaction.$id, values);
        toast({ title: "Transaction updated successfully!" });
      } else {
        await createTransaction({ ...values, userId: user.id });
        toast({ title: "Transaction created successfully!" });
      }
  
      queryClient.invalidateQueries([Query_Keys.GET_USER_TRANSACTIONS]);
      navigate("/");
    } catch (error) {
      console.error("Submission Error:", error);
      toast({ title: "Something went wrong!", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }
  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Type</FormLabel>
              <FormControl>
                <TypeToggle onChange={field.onChange} value={field.value as "income" | "expense"} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input required type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="account"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <AccountDropdown value={field.value} onChange={field.onChange} />
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
              <FormControl>
                <CategoryDropdown value={field.value} onChange={field.onChange} 
                type={form.watch("type") as "income" | "expense"} // ✅ Type-safe
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Add note</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DatePicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <p className="text-xs text-slate-500">*By default, today's date will be selected</p>


        {isRecurring && (
          <>
            <FormField
              control={form.control}
              name="interval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Interval</FormLabel>
                  <FormControl>
                    <IntervalDropdown {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enddate"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DatePicker 
                      value={field.value} 
                      onChange={field.onChange} 
                      minDate={form.getValues("date")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button type="button" onClick={() => 
        {
          form.reset();
          if (onClose)
            {onClose();}
          }}>
          Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {transaction ? "Update" : "Submit"}
          </Button>
      </form>
    </Form>
  );
};

export default CardForm;

/*<FormField
          control={form.control}
          name="isRecurring"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recurring transaction</FormLabel>
              <FormControl>
                <Switch
                  checked={isRecurring}
                  onCheckedChange={(checked) => {
                    setIsRecurring(checked);
                    field.onChange(checked);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />*/