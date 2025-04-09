import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js?url";
import axios from "axios";
import { geminiAPIKey } from "@/lib/appwrite/config";
import {GoogleGenerativeAI} from "@google/generative-ai"

GlobalWorkerOptions.workerSrc = workerSrc;

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateText";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Extracts text from a PDF file in the browser.
 * @param file - The PDF file.
 * @returns Extracted text from the PDF.
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      try {
        const typedArray = new Uint8Array(reader.result as ArrayBuffer);
        const pdf = await getDocument({ data: typedArray }).promise;
        let extractedText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
        }

        resolve(extractedText);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
  });
};

/**
 * Sends extracted text to Gemini API for transaction extraction.
 * @param pdfText - The raw text extracted from the PDF.
 * @returns Parsed transaction data in JSON format.
 */
export const analyzeTransactionsWithGemini = async (pdfText: string): Promise<any> => {
    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY is missing. Please check your .env file.");
    }
  
    const prompt = `
  Extract structured transaction data from the following bank statement. Identify the category based on the description.
    
  ### Bank Statement:
  ${pdfText}
  
  ### Instructions:
  1. **Extract transactions**: Ignore non-transactional details like account number, statement period, and headers.
  2. **Use only the transaction date** (not value date).
  3. **Infer the category**:
     - If the description contains "UPI/****" or "UPI/", categorize it as **"UPI"**.
     - If it contains "Cheque" or "Chq No.", categorize it as **"Cheque"**.
     - If it contains "NEFT" or "RTGS", categorize it as **"Bank Transfer"**.
     - If it contains "ATM Withdrawal", categorize it as **"ATM"**.
     - If it contains "Deposit" (like CMS Deposit, Cash Deposit), categorize it as **"Deposit"**.
     - If it cannot be inferred, categorize it as **"Other"**.
  4. **Modify Description**:
     - If the transaction is a UPI payment with a name (e.g., "UPI/12345678/10:57:06/UPI/JohnDoe@okhdfc"), extract the name and update the description:
       - "Credit from John Doe - UPI Payment" (for credit)
       - "Debit to John Doe - UPI Payment" (for debit)
     - If a name is not found, default to "UPI Payment", "NEFT Payment", "Cheque Payment", etc.
  5. **Set type as "income" or "expense"**:
     - If the transaction is in the **Credit** column, mark **type as "income"**.
     - If the transaction is in the **Debit** column, mark **type as "expense"**.
  
  ### Output Format:
  Return structured JSON **only** (no extra text):
  \`\`\`json
  [
    {
      "date": "DD-MMM-YYYY",
      "category": "Category Name",
      "description": "Meaningful Description",
      "amount": 0.00,
      "type": "income" or "expense"
    }
  ]
  \`\`\`
    `;
  
    try {
     // Use Gemini SDK with structured output mode
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;

    // Use Gemini's `text()` method to get the structured output
    const responseText = await response.text();

    // Ensure response is pure JSON by extracting JSON part
    const jsonStart = responseText.indexOf("[");
    const jsonEnd = responseText.lastIndexOf("]") + 1;
    const jsonString = responseText.substring(jsonStart, jsonEnd);

    console.log("Raw Response:", responseText);
    console.log("Extracted JSON:", jsonString);

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
};