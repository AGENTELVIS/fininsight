import { useGetUserAccounts } from "@/lib/react-query/queriesAndMutations.ts";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Models } from "appwrite";
import { useUserContext } from "@/context/AuthContext.tsx";
import { account } from "@/lib/appwrite/config";

type AccountDropdownProps = {
  value?: string;
  onChange: (value: string) => void;
};

const AccountDropdown = ({ value, onChange }: AccountDropdownProps) => {
  const {user} = useUserContext()
  const { data: accounts, isLoading, isError } = useGetUserAccounts(user?.id);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? "Loading..." : "Select an account"} />
      </SelectTrigger>
      <SelectContent className="z-[100]">
      {isError ? (
          <p className="text-red-500">Failed to load accounts</p>
        ) : (
          accounts?.documents.map((account: Models.Document) => (
            <SelectItem key={account.$id} value={account.$id}>
              {account.name} - ₹{account.amount}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default AccountDropdown;
