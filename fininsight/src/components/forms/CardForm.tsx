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
import { Calendar } from "../ui/calendar"
import { DropdownMenu } from "@radix-ui/react-dropdown-menu"
import CategoryDropdown from "./CategoryDropdown"
import Toggle from "../shared/Toggle"
import { CardValidation } from "@/lib/validation"
import { Models } from "appwrite"
import { useCreateTransaction } from "@/lib/react-query/queriesAndMutations"
import { useUserContext } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"

type CardFormProps = {
  transaction?:Models.Document;
}

const CardForm = ({ transaction } : CardFormProps) => {

  const { mutateAsync: createTransaction, isLoading: isLoadingCreate } = useCreateTransaction();
  const { user } = useUserContext();
  const {toast} = useToast();
  const  navigate  = useNavigate();

  // 1. Define your form.
  const form = useForm<z.infer<typeof CardValidation>>({
    resolver: zodResolver(CardValidation),
    defaultValues: {
      amount: transaction?.amount,
      category: transaction ? transaction?.category : "",
      note: transaction ? transaction?.note : "",
      date: transaction?.date ? new Date(transaction.date) : new Date(),
    },
  })
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof CardValidation>) {
    const newTransaction = await createTransaction({
      ...values,
      userId: user.id,
    })

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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="" {...field}/>
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
                <CategoryDropdown value={field.value} onChange={field.onChange}/>
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
              <Input type="datetime-local"
              value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
              onChange={(e) => field.onChange(new Date(e.target.value).toISOString())}
              />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

export default CardForm