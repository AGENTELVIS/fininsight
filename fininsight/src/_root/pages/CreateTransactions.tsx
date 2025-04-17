import { useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import { useSearchTransactions } from "@/lib/react-query/queriesAndMutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import CardForm from "@/components/forms/CardForm";
import TransactionInfo from "@/components/shared/TransactionInfo";
import ReceiptDropzone from "@/components/shared/ReceiptDropzone";

const CreateTransactions = () => {
  const { user } = useUserContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState<"all" | "week" | "month" | "year">("month");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: transactions, isLoading } = useSearchTransactions(user?.id || "", searchTerm, timeFilter);

  return (
    <div className="flex-1 overflow-y-auto h-screen px-4 sm:px-6 md:px-10 py-6 bg-gray-50">
      
      <div className="max-w-3xl mx-auto mb-10">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Add a New Transaction
        </h2>
        <div className="flex flex-col gap-4">
          <CardForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>
        </div>
      </div>

  
      <div className="max-w-4xl mx-auto mb-6 flex gap-4">
        <Input
          type="text"
          placeholder="Search by type, category, amount"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={timeFilter} onValueChange={(value: "all" | "week" | "month" | "year") => setTimeFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

    
      <div className="max-w-7xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full text-center">Loading...</div>
        ) : transactions?.documents && transactions.documents.length > 0 ? (
          [...transactions.documents]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((transaction) => (
              <TransactionInfo key={transaction.$id} transaction={transaction} />
            ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            No transactions found
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTransactions;
