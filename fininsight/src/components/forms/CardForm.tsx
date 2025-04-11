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
import { useCreateTransaction } from "@/lib/react-query/queriesAndMutations";
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

type CardFormProps = {
  transaction?: Models.Document;
  onClose?: () => void;
};

const CardForm = ({ transaction, onClose }: CardFormProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { mutateAsync: createTransaction, isLoading: isLoadingCreate } = useCreateTransaction();
  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      console.log("Submitting form with values:", values);
      
      let imageId = values.imageId;
      let imageUrl = values.imageUrl;

      if (selectedFile) {
        console.log("Uploading file...");
        const { fileId, fileUrl } = await uploadFile(selectedFile);
        console.log("File uploaded successfully:", { fileId, fileUrl });
        imageId = fileId;
        imageUrl = fileUrl;
      }

      const transactionData = {
        ...values,
        userId: user?.id || "",
        isRecurring: false,
        imageId,
        imageUrl,
      };
      console.log("Creating/updating transaction with data:", transactionData);

      if (!imageUrl) delete transactionData.imageUrl;
      if (!imageId) delete transactionData.imageId;
      console.log("Final data sent to Appwrite:", transactionData);

      if (transaction) {
        await updateTransaction(transaction.$id, transactionData);
        console.log("Transaction updated successfully");
        toast({ title: "Transaction updated successfully!" });
      } else {
        await createTransaction(transactionData);
        console.log("Transaction created successfully");
        toast({ title: "Transaction created successfully!" });
      }

      queryClient.invalidateQueries([Query_Keys.GET_USER_TRANSACTIONS]);
      setIsModalOpen(false);
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
    <>
      <div className="relative">
        <ReceiptDropzone />
        <Button 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-40 bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-md"
          onClick={() => setIsModalOpen(true)}
        >
          Add Transaction
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md p-0 z-[100]" aria-describedby="transaction-form-description">
          <DialogTitle></DialogTitle>
          <DialogDescription id="transaction-form-description">
          </DialogDescription>
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
                              variant="ghost"
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
                      setIsModalOpen(false);
                      if (onClose) onClose();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoadingCreate}
                    
                    className="flex-1"
                  >
                    {transaction ? "Update" : "Submit"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CardForm;
