import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { extractTextFromPDF, analyzeTransactionsWithGemini } from "./PdfProcessor";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type Transaction = {
  date: string;
  category: string;
  description: string;
  amount: number;
  type: "income" | "expense";
};

const PdfUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const processPdf = async (file: File) => {
    try {
      const pdfText = await extractTextFromPDF(file);
      const extractedTransactions = await analyzeTransactionsWithGemini(pdfText);
  
      // Directly set the transactions (Gemini already returns JSON)
      if (Array.isArray(extractedTransactions)) {
        setTransactions(extractedTransactions);
      } else {
        console.error("Invalid Gemini API response:", extractedTransactions);
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      processPdf(file);
    },
    accept: { "application/pdf": [".pdf"] },
  });

  return (
    <div className="flex flex-col items-center p-6">
      <div {...getRootProps()} className="border-2 border-dashed p-6 rounded-lg cursor-pointer">
        <input {...getInputProps()} />
        <p>Drag & drop a PDF file here, or click to select one</p>
      </div>

      {transactions.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((txn, index) => (
              <TableRow key={index}>
                <TableCell>{txn.date}</TableCell>
                <TableCell>{txn.category}</TableCell>
                <TableCell>{txn.description}</TableCell>
                <TableCell>₹{txn.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default PdfUploader;
