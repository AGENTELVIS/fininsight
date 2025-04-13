import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AccountDrawer from "@/components/shared/AccountDrawer";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserAccounts } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import { useUpdateAccount } from "@/lib/react-query/queriesAndMutations";
import { useQueryClient } from "@tanstack/react-query";
import { Query_Keys } from "@/lib/react-query/queryKeys";
import { useToast } from "@/hooks/use-toast";

import AccountInfoCard from "@/components/shared/AccountInfoCard";

const CreateAccount = () => {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Models.Document | null>(null);
    const { user } = useUserContext();
    const { data: accounts, isLoading } = useGetUserAccounts(user?.id);

    const handleEdit = (account: Models.Document) => {
        setSelectedAccount(account);
        setOpenDrawer(true);
    };

    const handleAdd = () => {
        setSelectedAccount(null);
        setOpenDrawer(true);
    };

    const queryClient = useQueryClient();
    const { mutateAsync: updateAccount } = useUpdateAccount();
    const { toast } = useToast();

    const handleSetDefault = async (accountId: string) => {
    try {
        const currentAccounts = accounts?.documents || [];

        await Promise.all(
        currentAccounts.map((acc) =>
            updateAccount({
            accountId: acc.$id,
            updatedData: {
                name: acc.name,
                amount: acc.amount,
                isDefault: acc.$id === accountId,
            },
            })
        )
        );

        await queryClient.invalidateQueries([Query_Keys.GET_USER_ACCOUNTS]);

        toast({ title: "Default account updated!" });
    } catch (err) {
        console.error("Failed to update default account", err);
        toast({ title: "Error updating default account", variant: "destructive" });
    }
    };

    return (
        <div className="bg-slate-50 rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Accounts</h2>
                <Button 
                    onClick={handleAdd}
                    className="w-8 h-8 p-0 rounded-full border-2 flex items-center justify-center"
                >
                    +
                </Button>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto space-y-3">
                {isLoading ? (
                    // Loading skeletons
                    Array(3).fill(0).map((_, index) => (
                        <div key={index} className="flex items-center justify-between p-2">
                            <div className="flex items-center space-x-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-4 w-32" />
                        </div>
                    ))
                ) : accounts?.documents.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                        No accounts created yet. Click the + button to create one.
                    </div>
                ) : (
                    accounts?.documents.map((account) => (
                        <AccountInfoCard 
                            key={account.$id} 
                            account={account} 
                            onEdit={handleEdit}
                            onSetDefault={() => handleSetDefault(account.$id)}
                        />
                    ))
                )}
            </div>
            
            <AccountDrawer 
                isOpen={openDrawer} 
                setIsOpen={setOpenDrawer} 
                account={selectedAccount || undefined}
            />
        </div>
    );
};

export default CreateAccount;
