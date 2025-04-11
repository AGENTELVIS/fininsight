import CardForm from "@/components/forms/CardForm";
import Loader from "@/components/shared/Loader";
import TransactionInfo from "@/components/shared/TransactionInfo";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserTransactions } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";

const CreateTransactions = () => {
  const { user } = useUserContext();
  const { data: transactions, isLoading, isError } = useGetUserTransactions(user?.id);

  return (
      <div className="flex-1 overflow-y-auto h-screen px-4 sm:px-6 md:px-10 py-6 bg-gray-50">
        <div className="max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Add a New Transaction</h2>
          <CardForm />
        </div>
      
        <div className="max-w-7xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && <Loader />}
          {!isLoading && !isError && transactions?.documents?.length > 0 ? (
            transactions.documents.map((tx: Models.Document) => (
              <div className="opacity-80 hover:opacity-100 transition-opacity duration-300">
                <TransactionInfo transaction={tx} key={tx.$id} />
              </div>
            ))
          ) : (
            !isLoading && !isError && (
              <p className="text-gray-500 col-span-full text-center">No transactions found.</p>
            )
          )}
          {isError && <p className="text-red-500 col-span-full text-center">Error loading transactions.</p>}
        </div>
      </div>  

  );
};

export default CreateTransactions;
