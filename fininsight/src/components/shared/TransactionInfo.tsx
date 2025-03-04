import { Models } from "appwrite";
import { format } from "date-fns";

type TransactionInfoProps = {
  transaction: Models.Document;
};

const TransactionInfo = ({ transaction }: TransactionInfoProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "do MMM yyyy");
  };

  return (
    <div className="relative bg-dark-2 rounded-lg border border-dark-4 p-5 lg:p-7 w-full max-w-sm shadow">
      <div className="flex justify-between items-center">
        <p className="font-medium">{transaction.category}</p>
        <p className="text-lg">₹{transaction.amount}</p>
      </div>
      <p className="text-gray-400 text-sm mt-1 text-end">{formatDate(transaction.date)}</p>
    </div>
  );
};

export default TransactionInfo;
