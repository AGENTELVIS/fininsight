import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
} from "@/components/ui/drawer";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useUserContext } from "@/context/AuthContext.tsx";
import { createAccount } from "@/lib/appwrite/api.ts";
import { toast, useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useCreateAccount, useDeleteAccount, useUpdateAccount } from "@/lib/react-query/queriesAndMutations.ts";
import { Models } from "appwrite";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Query_Keys } from "@/lib/react-query/queryKeys";
import { AccountValidation } from "@/lib/validation/index.ts";
import DeleteDialog from "./DeleteDialog.tsx";

type AccountDrawerProps = {
    account?: Models.Document;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
};

const AccountDrawer = ({ account, isOpen, setIsOpen }: AccountDrawerProps) => {
    const { mutateAsync: createNewAccount } = useCreateAccount();
    const { mutateAsync: updateExistingAccount  } = useUpdateAccount();
    const { mutateAsync: deleteAccount } = useDeleteAccount();
    const { toast } = useToast();
    const { user } = useUserContext();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof AccountValidation>>({
        resolver: zodResolver(AccountValidation),
        defaultValues: {
            name: account?.name || "",
            amount: account?.amount || 0,
        },
    });

    useEffect(() => {
        form.reset({
            name: account?.name || "",
            amount: account?.amount || 0,
        });
    }, [account, isOpen]);

    async function onSubmit(values: z.infer<typeof AccountValidation>) {
        console.log("Submitting Values:", values);
    
        let response;
        if (account) {
            // If an account exists, update it
            response = await updateExistingAccount({
                accountId: account.$id,
                updatedData: values,
            });
        } else {
            // Otherwise, create a new account
            response = await createNewAccount({
                ...values,
                userId: user.id,
            });
        }
    
        if (!response) {
            toast({ title: "Please try again" });
        } else {
            queryClient.invalidateQueries([Query_Keys.GET_USER_ACCOUNTS]);
            setIsOpen(false);
            navigate("/");
        }
    }
    
    async function handleDelete() {
        if (account) {
            await deleteAccount(account.$id);
            queryClient.invalidateQueries([Query_Keys.GET_USER_ACCOUNTS]);
            setIsOpen(false);
        }
    }
    

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{account ? "Edit Account" : "Create Account"}</DrawerTitle>
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
                                        <Input {...field} />
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
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">{account ? "Save Changes" : "Create Account"}</Button>
                    </form>
                </Form>
                <DrawerFooter className="flex justify-between">
                    <DrawerClose>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                    </DrawerClose>
                    {account && (
                        <DeleteDialog 
                        itemId={account.$id}
                        onDelete={deleteAccount}
                        title="Delete Account?"
                        description="Deleting this account will remove all associated transactions."
                        buttonText="Delete Account"/> // Move DeleteDialog here
                    )}
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};

export default AccountDrawer;