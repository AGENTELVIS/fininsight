import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js?url";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

GlobalWorkerOptions.workerSrc = workerSrc;

type ExtractedTransaction = {
  amount: number;
  category: string;
  note: string;
  date: string;
  type: "income" | "expense";
};

const PdfUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedTransactions, setExtractedTransactions] = useState<ExtractedTransaction[]>([]);

  // 🔹 Function to extract transactions from text
  const extractTransactionsFromText = (text: string) => {
    console.log("Extracted PDF Text:", text);
  
    const lines = text.split("\n");
    const transactions: ExtractedTransaction[] = [];
  
    lines.forEach((line) => {
      const match = line.match(
        /(\d{2}-[A-Za-z]{3}-\d{4})\s+(\d{2}-[A-Za-z]{3}-\d{4})\s+(.+?)\s+(-?\d+\.\d{2})?\s*(-?\d+\.\d{2})?\s*(-?\d+\.\d{2})?/
      );
  
      if (match) {
        const transactionDate = match[1];
        const description = match[3].trim();
        const debit = match[4] ? parseFloat(match[4]) : 0;
        const credit = match[5] ? parseFloat(match[5]) : 0;
  
        // Ensure type is explicitly `"income" | "expense"`
        const transaction: ExtractedTransaction = {
          date: transactionDate,
          category: description,
          amount: debit > 0 ? debit : credit, // Capture the correct amount
          note: "Imported from PDF",
          type: debit > 0 ? "expense" : "income",
        };
  
        console.log("Extracted Transaction:", transaction);
        transactions.push(transaction);
      }
    });
    console.log("Final Parsed Transactions:", transactions);
    setExtractedTransactions(transactions);
  };
  
  

  // 🔹 Handle PDF Processing using pdfjs-dist
  const processPdf = async (file: File) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
  
    reader.onload = async () => {
      try {
        const typedArray = new Uint8Array(reader.result as ArrayBuffer);
        const pdf = await getDocument({ data: typedArray }).promise;
        let fullText = "";
  
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(" ");
          fullText += pageText + "\n";
        }
  
        console.log("Extracted PDF Text:", fullText); // 🔹 Log extracted text
        extractTransactionsFromText(fullText);
      } catch (error) {
        console.error("Error processing PDF:", error);
      }
    };
  };
  
  useEffect(() => {
    console.log("Updated Transactions:", extractedTransactions);
  }, [extractedTransactions]);
  // 🔹 Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      processPdf(file);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
  });

  // 🔹 Handle Cancel
  const handleCancel = () => {
    setSelectedFile(null);
    setExtractedTransactions([]);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 p-6">
      {/* 🟢 Drag & Drop Zone */}
      <div
        {...getRootProps()}
        className="flex flex-col items-center justify-center w-2/3 md:w-1/2 lg:w-1/3 h-40 border-2 border-dashed border-blue-500 bg-white p-6 rounded-lg cursor-pointer hover:bg-blue-50 transition"
      >
        <input {...getInputProps()} />
        <p className="text-gray-600 text-center">
          Drag & drop a PDF file here, or click to select one
        </p>
      </div>

      {/* 🟢 Selected File Display */}
      {selectedFile && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow-md w-full max-w-lg">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-700 font-semibold">
              Selected file: <span className="text-blue-600">{selectedFile.name}</span>
            </p>
            <button onClick={handleCancel} className="text-red-500 font-semibold">✖ Cancel</button>
          </div>
        </div>
      )}

      {/* 🟢 Preview Table */}
      {extractedTransactions.length > 0 && (
        <div className="w-full max-w-3xl mt-6">
          <h2 className="text-lg font-semibold mb-2">Preview Transactions</h2>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extractedTransactions.map((transaction, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    ₹{transaction.amount}
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{transaction.note}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell className={`${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type.toUpperCase()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 🟢 Confirm Button */}
          <div className="mt-4 flex justify-end">
            <Button onClick={() => console.log("Saving transactions...")} className="bg-blue-500 text-white">
              Confirm & Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfUploader;
