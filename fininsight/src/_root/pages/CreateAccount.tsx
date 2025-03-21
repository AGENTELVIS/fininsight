import AccountDrawer from "@/components/shared/AccountDrawer.tsx";
import AccountInfoCard from "@/components/shared/AccountInfoCard.tsx";
import { Card } from "@/components/ui/card.tsx";
import { useUserContext } from "@/context/AuthContext.tsx";
import { useGetUserAccounts } from "@/lib/react-query/queriesAndMutations.ts";
import { Models } from "appwrite";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const CreateAccount = () => {
    const { user } = useUserContext();
    const { data: accounts, isLoading, isError } = useGetUserAccounts(user?.id);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Models.Document | null>(null);

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Failed to load accounts</p>;

    return (
        <div>
            <Card className="p-5 space-x-10">
                <div className="flex justify-between">
                    <h1>Accounts</h1>
                    <Button
                        onClick={() => {
                            setSelectedAccount(null);
                            setIsOpen(true);
                        }}
                        className="bg-blue-500 text-white"
                    >
                        + Add Account
                    </Button>
                </div>
                <div className="space-y-3">
                    {accounts?.documents.map((account) => (
                        <div key={account.$id} className="flex justify-between items-center p-3 border rounded">
                            <AccountInfoCard account={account} />
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSelectedAccount(account);
                                    setIsOpen(true);
                                }}
                            >
                                Edit
                            </Button>
                        </div>
                    ))}
                </div>
            </Card>
            <AccountDrawer
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                account={selectedAccount || undefined}
            />
        </div>
    );
};

export default CreateAccount;
