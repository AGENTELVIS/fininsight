import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useCreateTransaction, useGetUserAccounts } from '@/lib/react-query/queriesAndMutations';
import { useUserContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { ExtractedData } from '@/types';
import ReceiptScanner from './RecieptScanner';
import ReceiptReviewModal from './ReceiptReviewModal';
import { appwriteConfig, storage } from '@/lib/appwrite/config';
import { ID } from 'appwrite';
import { uploadFile } from "@/lib/appwrite/api";

const ReceiptDropzone: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { mutateAsync: createTransaction } = useCreateTransaction();
  const { user } = useUserContext();
  const { toast } = useToast();
  const { data: accounts } = useGetUserAccounts(user?.id);

  const onDrop = async (acceptedFiles: File[]) => {
    setIsDragging(false);
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setSelectedFile(file);
    setLoading(true);
  };

  const handleExtract = (data: ExtractedData) => {
    setExtractedData(data);
    setLoading(false);
    setIsModalOpen(true);
  };

  const handleConfirm = async (accountId: string, saveImage: boolean) => {
    if (!user || !extractedData) return;

    if (!extractedData.total || !extractedData.date || !extractedData.category) {
      toast({
        title: "Incomplete receipt data",
        description: "Some required information could not be extracted. Please verify the details manually.",
        variant: "destructive",
      });
      return;
    }

    const selectedAccount = accounts?.documents.find(acc => acc.$id === accountId);
    const amount = parseFloat(extractedData.total);
    if (selectedAccount && selectedAccount.amount < amount) {
      toast({
        title: "Insufficient Balance",
        description: `The selected account has insufficient balance. Current balance: ${selectedAccount.amount}`,
        variant: "destructive"
      });
      return;
    }

    try {
      let imageId = '';
      let imageUrl = '';

      if (saveImage && selectedFile) {

        const { fileId, fileUrl } = await uploadFile(selectedFile);
        imageId = fileId;
        imageUrl = fileUrl.toString(); 
      }

      const decimalPart = amount % 1;
      const roundedAmount = decimalPart >= 0.5 ? Math.ceil(amount) : Math.floor(amount);

      const transactionData = {
        userId: user.id,
        amount: roundedAmount,
        category: extractedData.category,
        note: `Purchased at ${extractedData.merchant || 'Unknown Merchant'}`,
        date: new Date(extractedData.date.split('-').reverse().join('-')),
        type: 'expense',
        account: accountId,
        imageId: imageId || undefined,
        ...(imageUrl ? { imageUrl } : {}), 
      };

      await createTransaction(transactionData);

      toast({
        title: "Transaction created successfully!",
        description: `Added ${extractedData.merchant || 'Unknown Merchant'} transaction for ₹${extractedData.total}`,
      });

      setIsModalOpen(false);
      setSelectedFile(null);
      setExtractedData(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast({
        title: "Error creating transaction",
        description: "Something went wrong while creating the transaction",
        variant: "destructive",
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <>
      <Card className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive || isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm text-gray-600">
              {isDragActive
                ? "Drop the receipt here"
                : "Drag and drop a receipt image here, or click to select"}
            </p>
            <p className="text-xs text-gray-500">
              Supports JPG, PNG up to 5MB
            </p>
            {loading && <p className="text-sm text-blue-500">Processing receipt...</p>}
          </div>

        </div>
      </Card>

      {selectedFile && (
        <ReceiptScanner
          file={selectedFile}
          onExtract={handleExtract}
        />
      )}

      {extractedData && (
        <ReceiptReviewModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedFile(null);
            setExtractedData(null);
            setImagePreview(null);
          }}
          data={extractedData}
          onConfirm={handleConfirm}
          imagePreview={imagePreview || undefined}
        />
      )}
    </>
  );
};

export default ReceiptDropzone;
