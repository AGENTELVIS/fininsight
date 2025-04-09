import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash } from "lucide-react";

type DeleteDialogProps = {
  itemId: string;
  onDelete: (id: string) => Promise<void>; // Function to handle delete logic
  title?: string;
  description?: string;
  buttonText?: string;
};

const DeleteDialog = ({ itemId, onDelete, title, description, buttonText }: DeleteDialogProps) => {
  const handleDelete = async () => {
    await onDelete(itemId);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="bg-red-500 text-white px-4 py-2 rounded">
          {buttonText || ""}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title || "Are you sure?"}</AlertDialogTitle>
          <AlertDialogDescription>
            {description || "This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDialog;
