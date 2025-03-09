import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
  } from "@/components/ui/drawer"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
  FormMessage,
} from "@/components/ui/form"  
import { Button } from "../ui/button"
import { Plus } from "lucide-react"
import { AccountValidation } from "@/lib/validation"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useUserContext } from "@/context/AuthContext"
import { createAccount } from "@/lib/appwrite/api"
import { toast, useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { useCreateAccount } from "@/lib/react-query/queriesAndMutations"
import { Models } from "appwrite"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

type AccountDrawerProps = {
    account?:Models.Document;
}

const AccountDrawer = ({account}:AccountDrawerProps) => {
    const {mutateAsync: createNewAccount } = useCreateAccount()
    const {toast} = useToast();
    const { user } = useUserContext();
    const  navigate  = useNavigate();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof AccountValidation>>({
        resolver: zodResolver(AccountValidation),
        defaultValues: {
            name: account?.name || "",
            amount: account?.amount || 0,
        },
    });

    async function onSubmit(values: z.infer<typeof AccountValidation>) {
        console.log("Submitting Values:", values);

        const newAccount = await createAccount({
            ...values,
            userId:user.id,
        });

        console.log("Account created",newAccount)

        if(!newAccount){
        toast({
            title: 'Please try again',
        })
        }

        setOpen(false);

        // Refresh accounts list immediately
        queryClient.invalidateQueries(["GET_ACCOUNTS"]);

        navigate('/');
    }

  return (
    
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger>
                <Button> Create Account <Plus/></Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                <DrawerTitle>Create Account</DrawerTitle>
                </DrawerHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                <Input {...field}/>
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
                                <Input type="number" {...field}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
                <DrawerFooter>
                <DrawerClose>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
          
        </Drawer>
        

  )
}


export default AccountDrawer