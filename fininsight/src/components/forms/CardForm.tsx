import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import DatePicker from "../shared/DatePicker";
import CategoryDropdown from "./CategoryDropdown";
import { CardValidation } from "@/lib/validation";
import { Models } from "appwrite";
import { useCreateTransaction, useGetUserAccounts } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import TypeToggle from "../shared/TypeToggle";
import AccountDropdown from "../shared/AccountDropdown";
import { Query_Keys } from "@/lib/react-query/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "../ui/switch";
import IntervalDropdown from "../shared/IntervalDropdown";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { appwriteConfig, storage } from "@/lib/appwrite/config";
import { ID } from "appwrite";
import { Card } from "@/components/ui/card";
import { updateTransaction, uploadFile } from "@/lib/appwrite/api";
import ReceiptDropzone from "../shared/ReceiptDropzone";
import { X } from "lucide-react";
import TransactionModal from "../shared/TransactionModal";

type CardFormProps = {
  transaction?: Models.Document;
  onClose?: () => void;
  isOpen?: boolean;
  hideReceiptDropzone?: boolean;
  hideAddButton?: boolean;
};

const CardForm = ({ 
  transaction, 
  onClose, 
  isOpen = false, 
  hideReceiptDropzone = false,
  hideAddButton = false 
}: CardFormProps) => {
  const [isModalOpen, setIsModalOpen] = useState(isOpen);

  return (
    <>
      {!hideAddButton && (
        <div className="relative h-full">
          {!hideReceiptDropzone && <ReceiptDropzone />}
          <Button 
            className="absolute bottom-0 left-0 right-0 w-full rounded-b-xl bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-md h-10"
            onClick={() => setIsModalOpen(true)}
          >
            Add Transaction
          </Button>
        </div>
      )}

      <TransactionModal
        transaction={transaction}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (onClose) onClose();
        }}
        hideReceiptDropzone={hideReceiptDropzone}
      />
    </>
  );
};

export default CardForm;
