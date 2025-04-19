import { useUserContext } from '@/context/AuthContext';
import { useGetUserBudgets, useSearchTransactions } from '@/lib/react-query/queriesAndMutations';
import { Card } from '@/components/ui/card';
import RecordsTable from '@/components/shared/RecordsTable';
import BudgetsTable from '@/components/shared/BudgetsTable';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileDown, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Records = () => {
  const { user } = useUserContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState<"all" | "week" | "month" | "year">("all");
  const { data: transactions, isLoading: isTransactionsLoading } = useSearchTransactions(user?.id || "", searchTerm, timeFilter);
  const { data: budgets, isLoading: isBudgetsLoading } = useGetUserBudgets(user?.id);
  const [,setActiveTab] = useState('transactions');

  const exportToCSV = () => {
    const headers = ['Date', 'Category', 'Description', 'Amount', 'Type'];
    const csvContent = [
      headers.join(','),
      ...(transactions?.documents || []).map(tx => [
        new Date(tx.date).toISOString().split('T')[0],
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
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Transaction History', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toISOString().split('T')[0]}`, 14, 22);

    const tableData = (transactions?.documents || []).map(tx => [
      new Date(tx.date).toISOString().split('T')[0],
      tx.category,
      tx.note || '-',
      tx.amount.toString(),
      tx.type
    ]);

    autoTable(doc, {
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

    doc.save(`transactions_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Records</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-white hover:bg-gray-50"
          >
            <FileText className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-white hover:bg-gray-50"
          >
            <FileDown className="h-4 w-4" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="transactions" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-6 w-full">
          <div className="flex gap-4 mb-6">
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

          {isTransactionsLoading ? (
            <div className="space-y-4 w-full">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="w-full">
              <RecordsTable transactions={transactions?.documents || []} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="budgets" className="mt-6 w-full">
          <Card className="w-full">
            {isBudgetsLoading ? (
              <div className="space-y-4 w-full p-6">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="w-full p-6">
                <BudgetsTable budgets={budgets?.documents || []} />
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Records;