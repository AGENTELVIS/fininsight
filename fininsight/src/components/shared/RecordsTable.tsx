import React, { useState } from "react";
import { useGetUserTransactions, useDeleteTransaction } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Models } from "appwrite";
import { Trash, Edit, ChevronLeft, ChevronRight, FileDown, FileText } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import CardForm from "@/components/forms/CardForm";
import { useQueryClient } from "@tanstack/react-query";
import { Query_Keys } from "@/lib/react-query/queryKeys";
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
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

const ITEMS_PER_PAGE = 7;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Models.Document | null>(null);

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTransactions = transactions.slice(startIndex, endIndex);

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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Category', 'Description', 'Amount', 'Type'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(tx => [
        format(new Date(tx.date), 'yyyy-MM-dd'),
        tx.category,
        `"${(tx.note || '').replace(/"/g, '""')}"`,
        tx.amount,
        tx.type
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Transaction History', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on ${format(new Date(), 'yyyy-MM-dd')}`, 14, 22);

    // Prepare data for the table
    const tableData = transactions.map(tx => [
      format(new Date(tx.date), 'yyyy-MM-dd'),
      tx.category,
      tx.note || '-',
      tx.amount.toString(),
      tx.type
    ]);

    // Add the table using autoTable
    (doc as any).autoTable({
      head: [['Date', 'Category', 'Description', 'Amount', 'Type']],
      body: tableData,
      startY: 30,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        3: { cellWidth: 'auto' }
      }
    });

    // Save the PDF
    doc.save(`transactions_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="w-[15%]">Date</TableHead>
              <TableHead className="w-[25%]">Category</TableHead>
              <TableHead className="w-[30%]">Description</TableHead>
              <TableHead className="w-[20%]">Amount</TableHead>
              <TableHead className="w-[10%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentTransactions.map((transaction) => (
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
                <TableCell className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      onClick={() => handleEdit(transaction)} 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4 text-gray-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 hover:bg-red-50"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this transaction?")) {
                          handleDeleteTransaction(transaction.$id);
                        }
                      }}
                    >
                      <Trash className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {transactions.length === 0 && <p className="text-gray-500 text-center mt-4">No transactions found.</p>}

      {transactions.length > 0 && (
        <div className="flex items-center justify-between mt-4 px-4">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(endIndex, transactions.length)} of {transactions.length} transactions
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md p-0 z-[100] border-0">
          <CardForm 
            transaction={selectedTransaction || undefined} 
            onClose={handleClose} 
            isOpen={isModalOpen}
            hideReceiptDropzone={true}
            hideAddButton={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecordsTable;
