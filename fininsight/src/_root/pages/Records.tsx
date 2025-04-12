import { useUserContext } from '@/context/AuthContext';
import { useGetAllTransactions, useGetUserBudgets } from '@/lib/react-query/queriesAndMutations';
import { Card } from '@/components/ui/card';
import RecordsTable from '@/components/shared/RecordsTable';
import BudgetsTable from '@/components/shared/BudgetsTable';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Records = () => {
  const { user } = useUserContext();
  const { data: transactions, isLoading: isTransactionsLoading } = useGetAllTransactions(user?.id);
  const { data: budgets, isLoading: isBudgetsLoading } = useGetUserBudgets(user?.id);
  const [activeTab, setActiveTab] = useState('transactions');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Records</h2>
      </div>

      <Tabs defaultValue="transactions" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-6 w-full">
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