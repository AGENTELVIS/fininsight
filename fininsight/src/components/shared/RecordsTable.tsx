import React, { useState } from "react";
import { useGetUserTransactions, useDeleteTransaction } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Models } from "appwrite";
import { Trash, Edit } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import CardForm from "@/components/forms/CardForm";
import { useQueryClient } from "@tanstack/react-query";
import { Query_Keys } from "@/lib/react-query/queryKeys";
import DeleteDialog from "./DeleteDialog";
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { 
  ShoppingBag, 
  Utensils, 
  Home, 
  Film, 
  Receipt, 
  Plane, 
  HeartPulse, 
  GraduationCap, 
  CreditCard, 
  Gift, 
  Briefcase, 
  TrendingUp, 
  Wallet, 
  RefreshCw, 
  Building2 
} from 'lucide-react';

type RecordsTableProps = {
  transactions: Models.Document[];
};

const getCategoryIcon = (category: string, type: string) => {
  const iconSize = "h-5 w-5";
  const iconClass = "font-extrabold";

  if (type === "income") {
    switch (category) {
      case "salary":
        return <Wallet className={`${iconSize} ${iconClass}`} />;
      case "freelance":
        return <Briefcase className={`${iconSize} ${iconClass}`} />;
      case "investment":
        return <TrendingUp className={`${iconSize} ${iconClass}`} />;
      case "gift":
        return <Gift className={`${iconSize} ${iconClass}`} />;
      case "refund":
        return <RefreshCw className={`${iconSize} ${iconClass}`} />;
      case "bonus":
        return <Wallet className={`${iconSize} ${iconClass}`} />;
      case "rental_income":
        return <Building2 className={`${iconSize} ${iconClass}`} />;
      default:
        return <Wallet className={`${iconSize} ${iconClass}`} />;
    }
  } else {
    switch (category) {
      case "shopping":
        return <ShoppingBag className={`${iconSize} ${iconClass}`} />;
      case "food":
        return <Utensils className={`${iconSize} ${iconClass}`} />;
      case "home":
        return <Home className={`${iconSize} ${iconClass}`} />;
      case "entertainment":
        return <Film className={`${iconSize} ${iconClass}`} />;
      case "bills":
        return <Receipt className={`${iconSize} ${iconClass}`} />;
      case "travel":
        return <Plane className={`${iconSize} ${iconClass}`} />;
      case "health":
        return <HeartPulse className={`${iconSize} ${iconClass}`} />;
      case "education":
        return <GraduationCap className={`${iconSize} ${iconClass}`} />;
      case "subscriptions":
        return <CreditCard className={`${iconSize} ${iconClass}`} />;
      case "other":
        return <Receipt className={`${iconSize} ${iconClass}`} />;
      default:
        return <Receipt className={`${iconSize} ${iconClass}`} />;
    }
  }
};

const RecordsTable = ({ transactions }: RecordsTableProps) => {
  const { user } = useUserContext();
  const { mutateAsync: deleteTransaction } = useDeleteTransaction();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Models.Document | null>(null);

  const handleDeleteTransaction = async (transactionId: string) => {
    await deleteTransaction(transactionId);
    queryClient.invalidateQueries([Query_Keys.GET_USER_TRANSACTIONS]);
  };

  const handleEdit = (transaction: Models.Document) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setSelectedTransaction(null);
    setIsModalOpen(false);
  };

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Your Transactions</h2>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.$id} className="hover:bg-gray-50">
              <TableCell className="px-6 py-4">
                {format(new Date(transaction.date), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(transaction.category, transaction.type)}
                  <span className="font-medium text-gray-900">
                    {transaction.category}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-6 py-4">
                {transaction.note || '-'}
              </TableCell>
              <TableCell className={`px-6 py-4 font-medium ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  transaction.type === 'income' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {transaction.type}
                </span>
              </TableCell>
              <TableCell className="flex space-x-2">
                <Button onClick={() => handleEdit(transaction)} size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm" className="items-center">
                  <DeleteDialog
                    itemId={transaction.$id}
                    onDelete={handleDeleteTransaction}
                    title=""
                    description="Are you sure you want to delete this transaction? This action cannot be undone."
                    buttonText="Delete"
                  />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {transactions.length === 0 && <p className="text-gray-500 text-center mt-4">No transactions found.</p>}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md p-0 z-[100]">
          <CardForm transaction={selectedTransaction || undefined} onClose={handleClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecordsTable;
