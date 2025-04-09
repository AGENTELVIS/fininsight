import React, { useState } from "react";
import { useGetUserTransactions, useDeleteTransaction } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Models } from "appwrite";
import { Trash, Edit } from "lucide-react";
import Modal from "@/_root/pages/UpdateTransactions"; // Import Modal
import CardForm from "@/components/forms/CardForm"; // Import CardForm
import { useQueryClient } from "@tanstack/react-query";
import { Query_Keys } from "@/lib/react-query/queryKeys";
import DeleteDialog from "./DeleteDialog";

const RecordsTable: React.FC = () => {
  const { user } = useUserContext();
  const { data: transactions, isLoading, isError } = useGetUserTransactions(user?.id);
  const { mutateAsync: deleteTransaction } = useDeleteTransaction();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Models.Document | null>(null);

  const handleDeleteTransaction = async (transactionId: string) => {
    await deleteTransaction(transactionId);
    queryClient.invalidateQueries([Query_Keys.GET_USER_TRANSACTIONS]); // Refresh transactions
  };
  
  if (isLoading) return <p>Loading transactions...</p>;
  if (isError) return <p className="text-red-500">Error loading transactions.</p>;

  const handleEdit = (transaction: Models.Document) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setSelectedTransaction(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (transactionId: string) => {
    await deleteTransaction(transactionId);
  };

  return (
    <div className=" overflow-x-auto bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Your Transactions</h2>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead>Amount</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {transactions?.documents?.map((transaction: Models.Document) => (
            <TableRow key={transaction.$id} className="hover:bg-gray-50">
              <TableCell className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                ₹{transaction.amount}
              </TableCell>
              <TableCell>{transaction.category}</TableCell>
              <TableCell>{transaction.note || "-"}</TableCell>
              <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
              <TableCell className="flex space-x-2">
                <Button onClick={() => handleEdit(transaction)} size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="xs" className="items-center">
                  <DeleteDialog
                        itemId={transaction.$id}
                        onDelete={handleDeleteTransaction}
                        title=""
                        description="Are you sure you want to delete this transaction? This action cannot be undone."
                        buttonText= {<Trash />}
                    />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {transactions?.documents?.length === 0 && <p className="text-gray-500 text-center mt-4">No transactions found.</p>}

      {/* Modal for editing transaction */}
      <Modal isOpen={isModalOpen} onClose={handleClose}>
        <CardForm transaction={selectedTransaction || undefined} onClose={() => setIsModalOpen(false)}/>
      </Modal>
    </div>
  );
};

export default RecordsTable;
