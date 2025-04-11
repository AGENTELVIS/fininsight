import CardForm from "@/components/forms/CardForm.tsx"
import Loader from "@/components/shared/Loader.tsx";
import TransactionInfo from "@/components/shared/TransactionInfo.tsx";
import { Card } from "@/components/ui/card";
import { useUserContext } from "@/context/AuthContext.tsx";
import { useGetUserTransactions } from "@/lib/react-query/queriesAndMutations.ts";
import { Models } from "appwrite";

type TransactionInfoProps = {
  transaction: Models.Document;
};

const CreateTransactions = () => {
  const { user } = useUserContext();
  const { data: transactions, isLoading, isError } = useGetUserTransactions(user?.id);

  console.log("Fetched Transactions:", transactions);

  return (
    <div className='flex flex-1'>
      <div className='flex flex-col flex-1 items-center gap-10 overflow-scroll py-10 px-5 md:px-8 lg:p-14 w-1/2'>
        <div className="max-w-5xl flex items-start gap-3 justify-start w-full">
          <img 
            src="/assets/loader.svg"
            className='invert '
            height={30}
            width={30}
            alt='add'
          />
          <h2 className="h3 font-bold md:h2 text-left w-full">Transactions</h2>
        </div>

        {/* Transaction Form */}
        
          <CardForm />
       

        {isLoading && <Loader />}

        {!isLoading && !isError && transactions?.documents?.length > 0 ? (
          <ul className="flex flex-wrap gap-4 justify-start">
            {transactions.documents.map((tx: Models.Document) => (
              <TransactionInfo transaction={tx} key={tx.$id} />
            ))}
          </ul>
        ) : (
          !isLoading && !isError && <p>No transactions found</p>
        )}

        {isError && <p className="text-red-500">Error loading transactions.</p>}
      </div>
    </div>
  );
};

export default CreateTransactions;
