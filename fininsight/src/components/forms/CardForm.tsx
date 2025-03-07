import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "../ui/textarea"
import DatePicker from "../shared/DatePicker"
import CategoryDropdown from "./CategoryDropdown"
import { CardValidation } from "@/lib/validation"
import { Models } from "appwrite"
import { useCreateTransaction } from "@/lib/react-query/queriesAndMutations"
import { useUserContext } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Link, useNavigate } from "react-router-dom"
import TypeToggle from "../shared/TypeToggle"

type CardFormProps = {
  transaction?:Models.Document;
}

const CardForm = ({ transaction } : CardFormProps) => {
  const {mutateAsync: createTransaction, isLoading: isLoadingCreate } = useCreateTransaction();
  const { user } = useUserContext();
  const {toast} = useToast();
  const  navigate  = useNavigate();

  // 1. Define your form.
  const form = useForm<z.infer<typeof CardValidation>>({
    resolver: zodResolver(CardValidation),
    defaultValues: {
      amount: transaction? transaction?.amount : 0,
      category: transaction ? transaction?.category : "",
      note: transaction ? transaction?.note : "",
      date: transaction?.date ? new Date(transaction.date) : new Date(),
      type: transaction?.type || "expense",
    },
  })
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof CardValidation>) {
    console.log("Submitting Values:", values);

    const newTransaction = await createTransaction({
      ...values,
      userId: user.id,
    })

    console.log("trasaction created",newTransaction)

    if(!newTransaction){
      toast({
        title: 'Please try again',
      })
    }

    navigate('/');
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
                <TypeToggle onChange={(value) => field.onChange(value)} value={field.value as "income" | "expense"}/>
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
                <Input required={true} type="number" placeholder="" {...field}
                className=""
                />
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
              <CategoryDropdown 
              value={field.value} 
              onChange={field.onChange}
              
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
                <Textarea placeholder="" {...field}/>
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
              <FormLabel></FormLabel>
              <FormControl>
              <DatePicker value={field.value} onChange={field.onChange}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="text-xs text-slate-500">*By default todays date will be selected</p>
        <Button type="button" onClick={() => {
          form.reset({
            amount: 0,
            category: "",
            note: "",
            date: new Date(),
            type: "expense"
          });
        }}
        >
            Cancel
        </Button>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

export default CardForm