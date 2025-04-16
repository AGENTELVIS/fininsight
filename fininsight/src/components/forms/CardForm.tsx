import { Button } from "@/components/ui/button";
import { Models } from "appwrite";
import { useEffect, useState } from "react";
import ReceiptDropzone from "../shared/ReceiptDropzone";
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
