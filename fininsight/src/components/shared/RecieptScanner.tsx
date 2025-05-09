import { GoogleGenerativeAI } from '@google/generative-ai';
import React, { useState } from 'react';
import { ExtractedData } from '@/types';
import { useToast } from "@/hooks/use-toast";

type ReceiptScannerProps = {
  onExtract: (data: ExtractedData) => void;
  file: File;
};

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onExtract, file }) => {
  const [, setLoading] = useState(false);
  const { toast } = useToast();
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(API_KEY);

  const scanReceipt = async () => {
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
        You are a smart assistant that extracts structured info from receipt images.
        Analyze the items, merchant name, and overall purchase context to determine the most appropriate category.
        
        Category guidelines:
        - food: Restaurants, groceries, cafes, food delivery
        - shopping: Retail stores, clothing, electronics
        - travel: Airlines, hotels, car rentals, transportation
        - entertainment: Movies, events, streaming services
        - health: Medical expenses, pharmacy, fitness
        - home: Utilities, furniture, home improvement
        - education: Books, courses, school supplies
        - bills: Regular monthly services, utilities
        - subscriptions: Regular recurring payments, memberships
        - other: Anything that doesn't fit above categories

        Return only a JSON object like this:
        {
          "merchant": "string",
          "total": "number (in string form, like '123.45')",
          "date": "DD-MM-YYYY",
          "category": "home | travel | shopping | entertainment | food | health | education | bills | subscriptions | other"
        }

        If it is not a receipt, return only: {}
      `;

      const result = await model.generateContent([
        {
          inlineData: {
            data: base64,
            mimeType: file.type,
          },
        },
        prompt,
      ]);

      const geminiText = await result.response.text();

      let parsed;
      try {
        parsed = JSON.parse(
          geminiText.replace(/```json|```/g, '').trim()
        );
      } catch (error) {
        toast({
          title: "Error parsing receipt data",
          description: "Could not extract information from the image. Please try again or enter the details manually.",
          variant: "destructive",
        });
        return;
      }

      
      if (!parsed || Object.keys(parsed).length === 0) {
        toast({
          title: "No receipt data found",
          description: "Could not identify a valid receipt in the image. Please try again or enter the details manually.",
          variant: "destructive",
        });
        return;
      }

      
      if (!parsed.total || !parsed.date || !parsed.category) {
        toast({
          title: "Incomplete receipt data",
          description: "Some required information could not be extracted. Please verify the details manually.",
          variant: "destructive",
        });
        return;
      }

      onExtract(parsed as ExtractedData);
    } catch (error) {
      console.error("Error scanning receipt:", error);
      toast({
        title: "Error scanning receipt",
        description: "Something went wrong while scanning the receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    scanReceipt();
  }, [file]);

  return null; 
};

export default ReceiptScanner;
