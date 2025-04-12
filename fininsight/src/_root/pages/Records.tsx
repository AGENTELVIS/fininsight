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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Records</h2>
      </div>

      <Tabs defaultValue="transactions" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-6">
          {isTransactionsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <RecordsTable transactions={transactions?.documents || []} />
          )}
        </TabsContent>

        <TabsContent value="budgets" className="mt-6">
          <Card className="p-6">
            {isBudgetsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <BudgetsTable budgets={budgets?.documents || []} />
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Records;