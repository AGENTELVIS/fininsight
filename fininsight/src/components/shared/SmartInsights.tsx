import { GoogleGenerativeAI } from '@google/generative-ai';
import React, { useEffect, useState } from 'react';
import { useGetUserTransactions, useGetUserAccounts, useGetUserBudgets } from '@/lib/react-query/queriesAndMutations';
import { useUserContext } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { subMonths } from 'date-fns';

interface CachedData {
  oneLiner: string;
  fullInsight: string;
  timestamp: number;
  dataHash: string;
}

interface BudgetStatus {
  category: string;
  amount: number;
  spent: number;
  percentage: number;
}

interface TransactionSummary {
  totalExpense: number;
  categories: Record<string, number>;
}

interface DataHash {
  budgetStatus: BudgetStatus[];
  transactionSummary: TransactionSummary;
}

const SmartInsight = () => {
  const [oneLiner, setOneLiner] = useState('');
  const [fullInsight, setFullInsight] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user } = useUserContext();
  const { data: transactions } = useGetUserTransactions(user?.id);
  const { data: accounts } = useGetUserAccounts(user?.id);
  const { data: budgets } = useGetUserBudgets(user?.id);

  const calculateDataHash = (data: { transactions: any; accounts: any; budgets: any }): string => {
    const budgetStatus = data.budgets?.documents.map((b: any) => ({
      category: b.category,
      amount: b.amount,
      spent: b.spent,
      percentage: (b.spent / b.amount) * 100
    })).sort((a: BudgetStatus, b: BudgetStatus) => a.category.localeCompare(b.category));

    const transactionSummary = data.transactions?.documents.reduce((acc: TransactionSummary, t: any) => {
      if (t.type === 'expense') {
        acc.totalExpense += t.amount;
        acc.categories[t.category] = (acc.categories[t.category] || 0) + t.amount;
      }
      return acc;
    }, { totalExpense: 0, categories: {} });

    return JSON.stringify({ budgetStatus, transactionSummary });
  };

  const shouldRegenerateInsight = (currentHash: string, cachedInsight: CachedData | null): boolean => {
    if (!cachedInsight) return true;

    const currentData = JSON.parse(currentHash) as DataHash;
    const cachedData = JSON.parse(cachedInsight.dataHash) as DataHash;

    const hasBudgetThresholdChange = currentData.budgetStatus.some((b: BudgetStatus) => {
      const cachedBudget = cachedData.budgetStatus.find((cb: BudgetStatus) => cb.category === b.category);
      if (!cachedBudget) return true;
      
      const currentPercentage = b.percentage;
      const cachedPercentage = cachedBudget.percentage;
      
      return (
        (currentPercentage >= 80 && cachedPercentage < 80) ||
        (currentPercentage >= 100 && cachedPercentage < 100) ||
        Math.abs(currentPercentage - cachedPercentage) > 20
      );
    });

    const hasSpendingChange = Math.abs(
      currentData.transactionSummary.totalExpense - cachedData.transactionSummary.totalExpense
    ) > (currentData.transactionSummary.totalExpense * 0.2);

    return hasBudgetThresholdChange || hasSpendingChange;
  };

  useEffect(() => {
    const generateInsight = async () => {
      if (!transactions?.documents || !accounts?.documents || !budgets?.documents) return;

      try {
        // Filter transactions for the last 3 months
        const threeMonthsAgo = subMonths(new Date(), 3);
        const recentTransactions = transactions.documents.filter(tx => 
          new Date(tx.date) >= threeMonthsAgo && tx.type === 'expense'
        );

        // Only generate insights if there are at least 10 expense transactions in the last 3 months
        if (recentTransactions.length < 10) {
          setOneLiner('💡 Add more transactions to get personalized insights!');
          setFullInsight('We need at least 10 expense transactions from the last 3 months to generate meaningful insights. Keep tracking your expenses!');
          setLoading(false);
          return;
        }

        // Get transactions from previous 3 months for comparison
        const sixMonthsAgo = subMonths(new Date(), 6);
        const previousTransactions = transactions.documents.filter(tx => 
          new Date(tx.date) >= sixMonthsAgo && 
          new Date(tx.date) < threeMonthsAgo && 
          tx.type === 'expense'
        );

        const currentHash = calculateDataHash({ transactions, accounts, budgets });
        const cachedInsight = localStorage.getItem('smartInsights') 
          ? JSON.parse(localStorage.getItem('smartInsights')!) as CachedData 
          : null;

        if (cachedInsight && !shouldRegenerateInsight(currentHash, cachedInsight)) {
          setOneLiner(cachedInsight.oneLiner);
          setFullInsight(cachedInsight.fullInsight);
          setLoading(false);
          return;
        }

        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
            You are a friendly and helpful financial assistant *within a budgeting and expense tracking app* that the user is actively using to manage their finances.

            Based on the user’s financial data provided below, generate two structured insights:

            ---

            1. **One-Liner Insight (label it as \`OneLiner:\`)**  
            → A short, emoji-friendly takeaway in one sentence.  
            → Format: 💡 You’ve spent 450 more on Food this month compared to your usual spending.

            ---

            2. **Expanded Insight (label it as \`FullInsight:\`)**  
            → A short, friendly summary (2–3 sentences) that includes:
            - A comparison between **current spending vs the average of the previous 3 months**
            - Clear mention of **specific categories** where spending has increased/decreased
            - If a **budget does not exist for an overspending category**, **suggest creating one**
            - End with **one practical and actionable tip** (e.g., meal prep, public transport, reduce impulse buys)

            ---

            ✅ DO:
            - Be positive and non-judgmental in tone.
            - Focus only on **category-wise spending**, **budgets**, and **actionable advice**.
            

            🚫 DO NOT:
            - Mention anything about “limited data”, “insufficient history”, or “unable to analyze”
            - Refer to other tools/apps/platforms
            - Criticize the data or the app

            ---

            User Data:  
            Recent Transactions (Last 3 months): ${JSON.stringify(recentTransactions)}  
            Previous Transactions (3–6 months ago): ${JSON.stringify(previousTransactions)}  
            Accounts: ${JSON.stringify(accounts.documents)}  
            Budgets: ${JSON.stringify(budgets.documents)}
            `;


        const result = await model.generateContent(prompt);
        const response = await result.response.text();

        const oneLinerMatch = response.match(/OneLiner:\s*(.+)/i);
        const fullInsightMatch = response.match(/FullInsight:\s*(.+)/is);

        const newOneLiner = oneLinerMatch?.[1]?.trim() || '💡 Unable to generate a smart insight right now.';
        const newFullInsight = fullInsightMatch?.[1]?.trim() || '';

        localStorage.setItem('smartInsights', JSON.stringify({
          oneLiner: newOneLiner,
          fullInsight: newFullInsight,
          timestamp: Date.now(),
          dataHash: currentHash
        }));

        setOneLiner(newOneLiner);
        setFullInsight(newFullInsight);
      } catch (error) {
        console.error('Error generating insight:', error);
        setOneLiner('💡 Unable to generate insight at this time.');
      } finally {
        setLoading(false);
      }
    };

    generateInsight();
  }, [transactions, accounts, budgets]);

  return (
    <Card className="p-4 mb-6 bg-gradient-to-r from-blue-50 to-indigo-100 border-0 shadow-md">
      <div className="flex items-center gap-2">
        <h3 className="text-sm md:text-base font-semibold text-gray-800">
          Smart Insight {loading && <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin text-gray-500 inline ml-2" />}
        </h3>
      </div>

      {!loading && oneLiner && (
        <div className="mt-2 flex items-center justify-between">
          <p className="text-lg md:text-sm lg:text-base text-gray-700 font-medium">{oneLiner}</p>
          {fullInsight && (
            <button
              onClick={() => setShowMore(prev => !prev)}
              className="text-xs md:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 ml-2 px-2 py-1 rounded-full hover:bg-blue-50 transition-colors"
            >
              {showMore ? (
                <>
                  <span className="hidden md:inline">Hide</span>
                  <ChevronUp size={14} />
                </>
              ) : (
                <>
                  <span className="hidden md:inline">View more</span>
                  <ChevronDown size={14} />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {showMore && fullInsight && (
        <p className="mt-3 text-xs md:text-sm text-gray-600 leading-relaxed">{fullInsight}</p>
      )}
    </Card>
  );
};

export default SmartInsight;
