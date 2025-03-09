import AccountDrawer from "@/components/shared/AccountDrawer";
import AccountCard from "@/components/shared/AccountDrawer"
import AccountInfoCard from "@/components/shared/AccountInfoCard";
import { Card } from "@/components/ui/card";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserAccounts } from "@/lib/react-query/queriesAndMutations";
//mport { useGetUserAccounts } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import { Loader } from "lucide-react";

type AccountInfoProps = {
  account: Models.Document,
};

const CreateAccount = () => {
  const { user } = useUserContext();
  const { data: accounts, isLoading, isError } = useGetUserAccounts(user?.id);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load accounts</p>;

  return (
      <div>
        <AccountDrawer/>
          <h1>Your Accounts</h1>
          {accounts?.documents.map((account) => (
              <AccountInfoCard key={account.$id} account={account} />
          ))}
      </div>
  );
}

export default CreateAccount