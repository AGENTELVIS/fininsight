import { useQueryClient } from "@tanstack/react-query";
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
    <Card className="w-full max-w-sm mx-auto p-4 relative min-h-[180px] flex flex-col">
      {/* Main content - vertically centered */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 font-semibold">
            {getCategoryIcon(transaction.category, transaction.type)}
            <p className="text-lg font-semibold">{transaction.category}</p>
          </div>
          <p className="text-lg font-medium">₹{transaction.amount}</p>
        </div>
      </div>

      {/* Bottom section - type and date */}
      <div className="flex justify-between items-center mt-auto pt-4">
        <p className="text-xs text-gray-500">
          {transaction.type === "income" ? (
            <span className="text-green-500">Income</span>
          ) : (
            <span className="text-red-500">Expense</span>
          )}
        </p>
        <p className="text-sm text-gray-500">
          {format(new Date(transaction.date), "MMM d, yyyy")}
        </p>
      </div>

      {transaction.imageId && (
        <>
          <div className="relative">
            {isImageExpanded && imageUrl && (
              <div className="w-full aspect-square overflow-hidden rounded-lg">
                <img
                  src={imageUrl}
                  alt="Transaction receipt"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 p-0"
            onClick={() => setIsImageExpanded(!isImageExpanded)}
          >
            {isImageExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </>
      )}
    </Card>
  );
};

export default TransactionInfo;
