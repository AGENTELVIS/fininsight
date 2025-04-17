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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useCreateAccount, useDeleteAccount, useUpdateAccount } from "@/lib/react-query/queriesAndMutations.ts";
import { Models } from "appwrite";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Query_Keys } from "@/lib/react-query/queryKeys";
import { AccountValidation } from "@/lib/validation/index.ts";
import DeleteDialog from "./DeleteDialog.tsx";
import { useMediaQuery } from "@/hooks/use-media-query";

type AccountDrawerProps = {
    account?: Models.Document;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
};

const AccountDrawer = ({ account, isOpen, setIsOpen }: AccountDrawerProps) => {
    const { mutateAsync: createNewAccount } = useCreateAccount();
    const { mutateAsync: updateExistingAccount } = useUpdateAccount();
    const { mutateAsync: deleteAccount } = useDeleteAccount();
    const { toast } = useToast();
    const { user } = useUserContext();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const form = useForm<z.infer<typeof AccountValidation>>({
        resolver: zodResolver(AccountValidation),
        defaultValues: {
            name: account?.name || "",
            amount: account?.amount || 0,
            isDefault: account?.isDefault || false,
        },
    });

    useEffect(() => {
        form.reset({
            name: account?.name || "",
            amount: account?.amount || 0,
            isDefault: account?.isDefault || false,
        });
    }, [account, isOpen]);

    async function onSubmit(values: z.infer<typeof AccountValidation>) {
        try {
            let response;
            if (account) {
               
                response = await updateExistingAccount({
                    accountId: account.$id,
                    updatedData: {
                        name: values.name,
                        amount: values.amount,
                        isDefault: values.isDefault,
                    },
                });
            } else {
                
                response = await createNewAccount({
                    userId: user.id,
                    name: values.name,
                    amount: values.amount,
                    isDefault: values.isDefault,
                });
            }

            if (!response) {
                toast({ title: "Please try again" });
            } else {
                queryClient.invalidateQueries([Query_Keys.GET_USER_ACCOUNTS]);
                setIsOpen(false);
                navigate("/");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast({ title: "Failed to save account. Please try again." });
        }
    }

    async function handleDelete() {
        if (account) {
            await deleteAccount(account.$id);
            queryClient.invalidateQueries([Query_Keys.GET_USER_ACCOUNTS]);
            setIsOpen(false);
        }
    }

    const formContent = (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-4">
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
                <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                            <FormControl>
                                <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </FormControl>
                            <FormLabel className="text-sm font-medium text-gray-700">
                                Set as default account
                            </FormLabel>
                        </FormItem>
                    )}
                />
                <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                        {account ? "Save Changes" : "Create Account"}
                    </Button>
                    {account && (
                        <DeleteDialog
                            accountId={account.$id}
                            onDelete={handleDelete}
                            title="Delete Account"
                            description="Are you sure you want to delete this account? This will delete all transactions related to this Account."
                        />
                    )}
                </div>
            </form>
        </Form>
    );

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{account ? "Edit Account" : "Create Account"}</DialogTitle>
                    </DialogHeader>
                    {formContent}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{account ? "Edit Account" : "Create Account"}</DrawerTitle>
                </DrawerHeader>
                {formContent}
            </DrawerContent>
        </Drawer>
    );
};

export default AccountDrawer;