import CardForm from "@/components/forms/CardForm"
import Loader from "@/components/shared/Loader";
import TransactionInfo from "@/components/shared/TransactionInfo";
import { useGetRecentTransactions } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";

type TransactionInfoProps ={
  transaction:Models.Document;
};

const CreateTransactions = ({transaction}: TransactionInfoProps) => {
  const { data: transactions, isLoading: isTransactionLoading, isError: isErrorTransactions } = useGetRecentTransactions();

  return (
    <div className='flex flex-1'>
      <div className='flex flex-col flex-1 items-center gap-10 overflow-scroll py-10 px-5 md:px-8 lg:p-14'>
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

        <CardForm />
        {isTransactionLoading && !transactions ? (
          <Loader />
        ) : ( 
          <ul className="flex flex-wrap gap-4 justify-start">
            {transactions?.documents.map((transaction: Models.Document) => (
              <TransactionInfo transaction={transaction} />
            ))}
          </ul> 
        )}
      </div>
    </div>
  )
}

export default CreateTransactions