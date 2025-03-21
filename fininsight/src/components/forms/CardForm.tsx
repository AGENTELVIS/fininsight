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

type CardFormProps = {
  transaction?: Models.Document;
};

const CardForm = ({ transaction }: CardFormProps) => {
  const { mutateAsync: createTransaction, isLoading: isLoadingCreate } = useCreateTransaction();
  const [isRecurring, setIsRecurring] = useState(false);
  const [dateError, setDateError] = useState("");
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
    console.log("Form Errors Before Submit:", form.formState.errors);

    if (Object.keys(form.formState.errors).length > 0) {
      console.log("Validation failed", form.formState.errors);
      return;
    }
    console.log("Submitting Values:", values);

    const newTransaction = await createTransaction({
      ...values,
      userId: user.id,
    });

    console.log("Transaction created", newTransaction);

    if (!newTransaction) {
      toast({
        title: "Please try again",
      });
    }

    queryClient.invalidateQueries([Query_Keys.GET_USER_TRANSACTIONS]);
    navigate("/");
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
                <CategoryDropdown value={field.value} onChange={field.onChange} />
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

        <FormField
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
        />

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

        <Button type="button" onClick={() => form.reset()}>Cancel</Button>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default CardForm;