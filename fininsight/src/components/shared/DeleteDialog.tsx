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
import { useDeleteAccount } from "@/lib/react-query/queriesAndMutations.ts";
import { useQueryClient } from "@tanstack/react-query";

type DeleteDialogProps = {
    accountId: string;
    setIsOpen: (open: boolean) => void; // Add setIsOpen prop
};

const DeleteDialog = ({ accountId, setIsOpen }: DeleteDialogProps) => {
    const { mutateAsync: deleteAccount } = useDeleteAccount();
    const queryClient = useQueryClient();

    const handleDelete = async () => {
        await deleteAccount(accountId);
        queryClient.invalidateQueries(); // Refresh data after deletion
        setIsOpen(false); // Close the drawer
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button className="bg-red-500 text-white px-4 py-2 rounded">
                    Delete Account
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Deleting this account will also delete all its transactions.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteDialog;
