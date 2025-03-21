import React from "react";
import { useGetUserTransactions } from "@/lib/react-query/queriesAndMutations"; // Fetch transactions
import { useUserContext } from "@/context/AuthContext"; // Get logged-in user
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Models } from "appwrite"; // Import Appwrite Models

const RecordsTable: React.FC = () => {
  const { user } = useUserContext();
  const { data: transactions, isLoading, isError } = useGetUserTransactions(user?.id);

  if (isLoading) return <p>Loading transactions...</p>;
  if (isError) return <p className="text-red-500">Error loading transactions.</p>;

  return (
    <div className="w-full overflow-x-auto bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Your Transactions</h2>

      <Table>
        {/* Table Headers */}
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="px-4 py-2">Amount</TableHead>
            <TableHead className="px-4 py-2">Category</TableHead>
            <TableHead className="px-4 py-2">Description</TableHead>
            <TableHead className="px-4 py-2">Date</TableHead>
            <TableHead className="px-4 py-2">Type</TableHead>
          </TableRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody>
          {transactions?.documents?.map((transaction: Models.Document) => (
            <TableRow key={transaction.$id} className="hover:bg-gray-50">
              <TableCell className={`px-4 py-2 font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>₹{transaction.amount}</TableCell>
              <TableCell className="px-4 py-2">{transaction.category}</TableCell>
              <TableCell className="px-4 py-2">{transaction.note || "N/A"}</TableCell>
              <TableCell className="px-4 py-2">{new Date(transaction.date).toLocaleDateString()}</TableCell>
              <TableCell className={`px-4 py-2 font-semibold items-center text-center ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                {transaction.type? transaction.type.toUpperCase(): "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Show message if no transactions */}
      {transactions?.documents?.length === 0 && <p className="text-gray-500 text-center mt-4">No transactions found.</p>}
    </div>
  );
};

export default RecordsTable;
