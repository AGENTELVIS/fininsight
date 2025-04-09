import { useUserContext } from '@/context/AuthContext';
import { getCategoryWiseSpending, getCurrentMonthTransactions, groupTransactionsByDay, groupTransactionsByMonth } from '@/lib/appwrite/api';
import { INewData } from '@/types';
import BarChart from '@/components/shared/BarChart';
import React, { useEffect, useState } from 'react'
import CategoryPieChart from '@/components/shared/CategoryPieChart';
import LineChart from '@/components/shared/LineChart';

const Graphs = () => {
    const { user } = useUserContext();
    const [loading, setLoading] = useState(false);
    const [fade, setFade] = useState(false);
    const [view, setView] = useState<"daily" | "weekly" | "monthly">("monthly");
    const [data, setData] = useState<{ day: string; income: number; expense: number  }[]>([]);
    const categories = ["Food", "Transport", "Bills", "Shopping", "Entertainment","Home","Subscriptions","Travel","Health","Other"];
    const [pieData, setPieData] = useState<{ category: string; total: number }[]>([]);

    useEffect(() => {
      const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true);
        const transactions = await getCurrentMonthTransactions(user?.id);

        const typedTransactions = transactions.documents as INewData[]
        const formattedTx = typedTransactions.map(tx => ({
            amount: tx.amount,
            date: tx.date.toString(),
            type: tx.type, // or toISOString()
          }));
          let grouped;
          if (view === "daily") {
            grouped = groupTransactionsByDay(formattedTx);
          } else {
            grouped = groupTransactionsByMonth(formattedTx);
          }
      
          setData(grouped);
          setLoading(false);
        };
      fetchData();

      const fetchPieData = async () => {
        if (!user?.id) return;
    
        const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const end = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    
        const result = await getCategoryWiseSpending(user.id, start, end, categories);
        setPieData(result);
      };
    
      fetchPieData();
    }, [user?.id,view]);

    return (
        <>
          <div className="flex gap-2 my-4">
            {["daily", "monthly"].map((v) => (
              <button
                key={v}
                onClick={() => {
                    if (v === view) return;
                    setFade(true);
                    setTimeout(() => {
                      setView(v as "daily" | "monthly");
                      setFade(false);
                    }, 200); // matches CSS transition duration
                  }}                  
                className={`px-4 py-2 rounded ${
                  view === v ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
      
          {/* Conditional rendering for chart */}
          <div
            className={`transition-opacity duration-300 ${
                fade ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
            >
            {loading ? (
                <div className="text-center py-10">Loading chart...</div>
            ) : view === "daily" ? (
                <BarChart data={data} />
            ) : (
                <LineChart data={data} />
            )}
          </div>

      
          <CategoryPieChart data={pieData} />
        </>
      );
}      

export default Graphs