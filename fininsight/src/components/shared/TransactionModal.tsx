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
import { Textarea } from "@/components/ui/textarea";
import DatePicker from "@/components/shared/DatePicker";
import CategoryDropdown from "@/components/forms/CategoryDropdown";
import { CardValidation } from "@/lib/validation";
import { Models } from "appwrite";
import { useCreateTransaction, useGetUserAccounts } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Query_Keys } from "@/lib/react-query/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { updateTransaction, uploadFile } from "@/lib/appwrite/api";
import { X } from "lucide-react";
import TypeToggle from "@/components/shared/TypeToggle";
import AccountDropdown from "@/components/shared/AccountDropdown";

type TransactionModalProps = {
  transaction?: Models.Document;
  isOpen: boolean;
  onClose: () => void;
  hideReceiptDropzone?: boolean;
};

const TransactionModal = ({ 
  transaction, 
  isOpen, 
  onClose,
  hideReceiptDropzone = false 
}: TransactionModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { mutateAsync: createTransaction } = useCreateTransaction();
  const { user } = useUserContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: accounts } = useGetUserAccounts(user?.id);

  const form = useForm<z.infer<typeof CardValidation>>({
    resolver: zodResolver(CardValidation),
    defaultValues: {
      amount: transaction?.amount || 0,
      category: transaction?.category || "",
      note: transaction?.note || "",
      date: transaction?.date ? new Date(transaction.date) : new Date(),
      type: transaction?.type || "expense",
      account: transaction?.account || "",
      imageId: transaction?.imageId || undefined,
      imageUrl: transaction?.imageUrl || undefined,
    }    
  });

  useEffect(() => {
    console.log("Form Errors:", form.formState.errors);
  }, [form.formState.errors]);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const clearImage = () => {
    form.setValue("imageId", "");
    form.setValue("imageUrl", "");
    setSelectedFile(null);
    const fileInput = document.getElementById("receipt") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onSubmit = async (values: z.infer<typeof CardValidation>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
  
    try {
      if (values.type === "expense") {
        const selectedAccount = accounts?.documents.find(acc => acc.$id === values.account);
        if (selectedAccount && selectedAccount.amount < values.amount) {
          toast({
            title: "Insufficient Balance",
            description: `The selected account has insufficient balance. Current balance: ${selectedAccount.amount}`,
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      let imageId = values.imageId;
      let imageUrl = values.imageUrl;

      if (selectedFile) {
        const { fileId, fileUrl } = await uploadFile(selectedFile);
        imageId = fileId;
        imageUrl = fileUrl;
      }

      const transactionData = {
        amount: values.amount,
        category: values.category,
        note: values.note,
        date: values.date,
        type: values.type,
        account: values.account,
        imageId,
        imageUrl,
      };

      if (!imageUrl) delete transactionData.imageUrl;
      if (!imageId) delete transactionData.imageId;

      if (transaction) {
        await updateTransaction(transaction.$id, transactionData);
        toast({ title: "Transaction updated successfully!" });
      } else {
        const newTransactionData = {
          ...transactionData,
          userId: user?.id || "",
          isRecurring: false,
        };
        await createTransaction(newTransactionData);
        toast({ title: "Transaction created successfully!" });
      }

      queryClient.invalidateQueries([Query_Keys.GET_USER_TRANSACTIONS]);
      onClose();
      form.reset();
      setSelectedFile(null);
    } catch (error) {
      console.error("Submission Error:", error);
      toast({ 
        title: "Something went wrong!", 
        description: "Failed to create/update transaction. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 z-[100] border-0">
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel></FormLabel>
                    <FormControl>
                      <TypeToggle 
                        value={field.value as "income" | "expense"} 
                        onChange={(value) => {
                          field.onChange(value);
                          form.setValue("type", value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className="text-sm font-medium text-gray-700">Amount</FormLabel>
                      <FormControl>
                        <Input 
                          required 
                          type="number" 
                          {...field} 
                          className="text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="account"
                    render={({ field }) => (
                      <FormItem className="flex-1 space-y-0">
                        <FormControl>
                          <AccountDropdown 
                            value={field.value} 
                            onChange={field.onChange} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="flex-1 space-y-0">
                        <FormControl>
                          <CategoryDropdown 
                            value={field.value} 
                            onChange={field.onChange} 
                            type={form.watch("type") as "income" | "expense"}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className="text-sm font-medium text-gray-700">Note</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="min-h-[60px] resize-none"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                {!hideReceiptDropzone && (
                  <FormField
                    control={form.control}
                    name="imageId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upload Receipt</FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input
                              id="receipt"
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200"
                            />
                          </FormControl>
                          {selectedFile && (
                            <Button
                              type="button"
                              size="icon"
                              onClick={clearImage}
                              className="h-8 w-8"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className="text-sm font-medium text-gray-700"></FormLabel>
                      <FormControl>
                        <DatePicker 
                          value={field.value} 
                          onChange={field.onChange} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <p className="text-xs text-gray-500">*By default, today's date will be selected</p>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    form.reset();
                    onClose();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;