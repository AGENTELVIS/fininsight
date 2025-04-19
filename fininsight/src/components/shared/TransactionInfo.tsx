
import { Models } from "appwrite";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appwriteConfig, storage } from "@/lib/appwrite/config";
import { Card } from "../ui/card";
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
} from "lucide-react";

type TransactionInfoProps = {
  transaction: Models.Document;
};

const getCategoryIcon = (category: string, type: string) => {
  const iconSize = "h-7 w-7";
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

const TransactionInfo = ({ transaction }: TransactionInfoProps) => {
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (transaction.imageId) {
      const url = storage.getFileDownload(appwriteConfig.storageId, transaction.imageId);
      setImageUrl(url.toString());
    }
  }, [transaction.imageId]);

  return (
    <Card className="w-full max-w-sm mx-auto p-5 relative min-h-[20px] flex flex-col justify-between shadow-md">
      
      <div className="flex flex-1 flex-col justify-center gap-5">
       
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {getCategoryIcon(transaction.category, transaction.type)}
            <p className="text-lg font-semibold">{transaction.category}</p>
          </div>
          <p className="text-lg font-medium">₹{transaction.amount}</p>
        </div>
  
       
        <div className="flex justify-between items-center text-sm text-gray-500 mt-1 px-1">
          <span
            className={
              transaction.type === "income"
                ? "text-green-500 font-medium"
                : "text-red-500 font-medium"
            }
          >
            {transaction.type === "income" ? "Income" : "Expense"}
          </span>
          <span>{format(new Date(transaction.date), "MMM d, yyyy")}</span>
        </div>
      </div>
  
     
      <div className="flex justify-center mt-4 min-h-[32px]">
        {transaction.imageId ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 z-10 bg-white shadow-sm"
            onClick={() => {
              const allCards = document.querySelectorAll(".receipt-img");
              allCards.forEach((el) => {
                if (el !== document.getElementById(transaction.$id)) {
                  el?.classList.remove("max-h-[300px]");
                  el?.classList.add("max-h-0");
                  el?.setAttribute("data-open", "false");
                }
              });
  
              const current = document.getElementById(transaction.$id);
              const isOpen = current?.getAttribute("data-open") === "true";
  
              current?.classList.toggle("max-h-[300px]", !isOpen);
              current?.classList.toggle("max-h-0", isOpen);
              current?.setAttribute("data-open", (!isOpen).toString());
  
              setIsImageExpanded(!isOpen);
            }}
          >
            {isImageExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        ) : (
          <div className="w-8 h-8" />
        )}
      </div>
  
     
      {transaction.imageId && (
        <div
          id={transaction.$id}
          className="receipt-img overflow-hidden rounded-lg max-h-0 transition-all duration-300"
          data-open="false"
        >
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Transaction receipt"
              className="w-full mt-3 object-cover rounded-md"
            />
          )}
        </div>
      )}
    </Card>
  );
};

export default TransactionInfo;