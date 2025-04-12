import { ID, Query, Models } from "appwrite";
import { INewUser, INewData, INewAccount, INewBudget, IUpdateUser, IBudget, ITransaction, TransactionsResponse } from "../../types/index.ts";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";
import { account, appwriteConfig, storage} from "./config.js";
import {  avatars , databases } from "./config.js";



export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw Error;

    const avatarUrl = new URL(avatars.getInitials(user.name));

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}

// ============================== SAVE USER TO DB
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SIGN IN
export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailPasswordSession(user.email, user.password);

    const currentUser = await getCurrentUser();

    console.log("current user:", currentUser)
    if(!currentUser) throw new Error("user is not authenticated")

    return session;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET ACCOUNT
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER
export async function getCurrentUser() {
  try {
    let currentAccount = await getAccount();

    if (!currentAccount) {
      console.warn("User not logged in, attempting session refresh...");

      // Attempt to refresh session
      try {
        await account.getSession("current");
        currentAccount = await getAccount();
      } catch (refreshError) {
        console.warn("Session refresh failed:", refreshError);
        return null;
      }
    }

    // Ensure `currentAccount` is defined before accessing `$id`
    if (!currentAccount) {
      console.warn("Still no user account after session refresh.");
      return null;
    }

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (currentUser?.documents?.length > 0) {
      return currentUser.documents[0];
    }

    return null; // No user found
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

export async function signOutAccount(){
  try {
    const session = await account.deleteSession("current")

    return session;
  } catch (error) {
    console.log(error);
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}
// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw new Error("Upload failed");

      const fileId = uploadedFile.fileId;
      const fileUrl = getFileView(fileId);
      if (!fileUrl) {
        await deleteFile(fileId);
        throw new Error("File view failed");
      }

      image = { ...image, imageUrl: fileUrl, imageId: fileId };
    }

    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        imageUrl: image.imageUrl,
      }
    );

    if (!updatedUser) {
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      throw new Error("User update failed");
    }

    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.log("Update error:", error);
  }
}

export function getFileView(fileId: string) {
  try {
    const fileUrl = storage.getFileView(
      appwriteConfig.storageId,
      fileId,
    );

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

export async function updateBudgetSpent(userId: string, category: string, amount: number, type: string) {
  try {
    // Get all budgets for this category
    const budgets = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.budgetCollectionId,
      [
        Query.equal("creator", userId),
        Query.equal("category", category)
      ]
    );

    // Update each budget's spent amount
    for (const budget of budgets.documents) {
      try {
        const currentSpent = Number(budget.spent || 0);
        let newSpent = currentSpent;
        
        if (type === "expense") {
          newSpent = currentSpent + amount;
        } else if (type === "income") {
          // If it's an income transaction, we don't update the spent amount
          continue;
        }
        
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.budgetCollectionId,
          budget.$id,
          { spent: newSpent }
        );
      } catch (err) {
        console.warn(`Failed to update budget ${budget.$id}:`, err);
        // Continue with other budgets even if one fails
        continue;
      }
    }
  } catch (error) {
    console.error("Error updating budget spent amount:", error);
  }
}

export async function createTransaction(transaction: INewData) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    if (!transaction.date) {
      throw new Error("Transaction date is required");
    }

    console.log("Creating transaction with data:", transaction);

    const newTransaction = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.transactionsCollectionId,
      ID.unique(),
      {
        creator: user.$id,
        amount: transaction.amount,
        category: transaction.category,
        note: transaction.note,
        date: new Date(transaction.date).toISOString(),
        type: transaction.type,
        account: transaction.account,
        imageId: transaction.imageId,
        imageUrl: transaction.imageUrl,
      }
    );    

    if (!newTransaction) {
      throw new Error("Failed to create transaction");
    }

    // Update account balance
    await updateAccountBalance(transaction.account, transaction.amount, transaction.type);
    
    try {
      await updateBudgetSpent(user.$id, transaction.category, transaction.amount, transaction.type);
    } catch (err) {
      console.warn("Budget update failed but transaction created:", err);
    }
    
    return newTransaction;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}



export async function getUserTransactions(userId?: string) {
  if (!userId) return { documents: [] };

  console.log("Fetching transactions for userId:", userId);

  // Ensure user is logged in
  const user = await getCurrentUser();
  if (!user) {
    console.warn("User not authenticated, skipping transaction fetch.");
    return { documents: [] };
  }

  try {
    const userTransactions = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.transactionsCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    return userTransactions ?? { documents: [] };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { documents: [] };
  }
}

export async function getRecentTransactions() {
  try {
    const transactions = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.transactionsCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!transactions) throw Error;

    return transactions;
  } catch (error) {
    console.log(error);
  }
} 

export async function createAccount(account: INewAccount){
  try {
    const newAccount = databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.accountsCollectionId,
      ID.unique(),
    {
      creator:account.userId,
      name: account.name,
      amount: account.amount
    }
    );

    return newAccount;
  } catch (error) {
    console.log(error)
  }
} 

export async function getUserAccounts(userId?: string) {
  if (!userId) return {documents: []};

  try {
    const userAccounts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.accountsCollectionId,
      [Query.equal("creator", userId)]
    );

    return userAccounts ?? { documents: [] }; // Ensure it's never `undefined`
  } catch (error) {
    console.log(error);
    return { documents: [] }; // Prevent infinite loading
  }
}


export async function updateAccountBalance(accountId: string, amount: number, type: string) {
  try {
    if (!accountId) {
      throw new Error("Invalid account ID");
    }

    // Fetch the existing account
    const account = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.accountsCollectionId,
      accountId
    );

    if (!account) throw new Error("Account not found");

    // Convert amount to a number to prevent string concatenation
    let currentBalance = Number(account.amount);
    let transactionAmount = Number(amount);

    let updatedBalance = currentBalance;
    if (type === "income") {
      updatedBalance += transactionAmount;
    } else if (type === "expense") {
      updatedBalance -= transactionAmount;
    }

    console.log(`Updating Account ID: ${accountId}, Current Balance: ${currentBalance}, Transaction Amount: ${transactionAmount}, Type: ${type}`);

    // Update account balance
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.accountsCollectionId,
      accountId,
      { amount: updatedBalance }
    );

    console.log("New balance should be:", updatedBalance);

    return updatedBalance;
  } catch (error) {
    console.error("Error updating balance:", error);
  }
}

export async function updateAccount(accountId: string, updatedData: Partial<INewAccount>) {
  try {
    const updatedAccount = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.accountsCollectionId,
      accountId,
      updatedData
    );

    return updatedAccount;
  } catch (error) {
    console.error("Error updating account:", error);
  }
}

export async function deleteAccount(accountId: string) {
  try {
    // Fetch transactions linked to this account
    const transactions = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.transactionsCollectionId,
      [Query.equal("account", accountId)]
    );

    // Delete each transaction
    for (const transaction of transactions.documents) {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.transactionsCollectionId,
        transaction.$id
      );
    }

    // Delete the account itself
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.accountsCollectionId,
      accountId
    );
  } catch (error) {
    console.error("Error deleting account and transactions:", error);
  }
}

export async function updateTransaction(transactionId: string, updatedData: Partial<INewData>) {
  try {
    // Get the existing transaction
    const existingTransaction = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.transactionsCollectionId,
      transactionId
    );

    if (!existingTransaction) throw new Error("Transaction not found");

    const oldAccountId = existingTransaction.account;
    const newAccountId = updatedData.account ?? oldAccountId;

    const oldAmount = Number(existingTransaction.amount);
    const newAmount = Number(updatedData.amount ?? oldAmount);

    const oldType = existingTransaction.type;
    const newType = updatedData.type ?? oldType;

    const isAccountChanged = oldAccountId !== newAccountId;
    const isTypeChanged = oldType !== newType;
    const isAmountChanged = oldAmount !== newAmount;

    // 🔁 Case 1: Account changed → revert old + apply new
    if (isAccountChanged) {
      await updateAccountBalance(oldAccountId, oldAmount, oldType === "income" ? "expense" : "income");
      await updateAccountBalance(newAccountId, newAmount, newType);
    }

    // 🔁 Case 2: Type changed (same account)
    if (isTypeChanged && oldAmount === newAmount) {
      // Net out the old type
      await updateAccountBalance(oldAccountId, oldAmount * 2, newType);
    } else if (isTypeChanged) {
      // Handle net effect of type change with different amounts
      await updateAccountBalance(oldAccountId, oldAmount, oldType === "income" ? "expense" : "income");
      await updateAccountBalance(oldAccountId, newAmount, newType);
    }
    

    // 🔁 Case 3: Amount changed (same account + same type)
    else if (isAmountChanged) {
      const diff = newAmount - oldAmount;
      const effectiveType = diff > 0 ? newType : (newType === "income" ? "expense" : "income");
      await updateAccountBalance(oldAccountId, Math.abs(diff), effectiveType);
    }

    // ✅ Finally update the transaction
    const updatedTransaction = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.transactionsCollectionId,
      transactionId,
      updatedData
    );
    console.log("Updating Transaction:", {
      oldAccountId,
      newAccountId,
      oldAmount,
      newAmount,
      oldType,
      newType,
      isAccountChanged,
      isTypeChanged,
      isAmountChanged
    });
    
    return updatedTransaction;
  } catch (error) {
    console.error("Error updating transaction:", error);
  }
}

export async function deleteTransaction(transactionId: string) {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.transactionsCollectionId,
      transactionId
    );
  } catch (error) {
    console.error("Error deleting transaction:", error);
  }
}

function calculateEndDate(startDate: Date, period: string, periodNumber: number): Date {
  switch (period) {
    case "daily":
      return addDays(startDate, periodNumber);
    case "weekly":
      return addWeeks(startDate, periodNumber);
    case "monthly":
      return addMonths(startDate, periodNumber);
    case "yearly":
      return addYears(startDate, periodNumber);
    default:
      return startDate;
  }
}

export async function createBudget(budget: INewBudget) {
  try {
    const startDate = budget.startDate ?? new Date(); // default to now if undefined
    const endDate = calculateEndDate(startDate, budget.period, budget.periodNumber);

    const newBudget = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.budgetCollectionId,
      ID.unique(),
      {
        creator: budget.userID,
        category: budget.category,
        amount: budget.amount,
        period: budget.period,
        periodNumber: budget.periodNumber,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        spent: 0, // Initialize spent to 0
      }
    );

    return newBudget;
  } catch (error) {
    console.log(error);
  }
}


export async function getUserBudgets(userId?: string): Promise<{ documents: IBudget[] }> {
  if (!userId) return { documents: [] };

  try {
    const userBudgets = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.budgetCollectionId,
      [
        Query.equal("creator", userId),
        Query.orderDesc("$createdAt")
      ]
    );

    // Ensure each budget has a spent field and matches the IBudget type
    const budgetsWithSpent = userBudgets.documents.map(budget => ({
      ...budget,
      spent: Number(budget.spent || 0),
      amount: Number(budget.amount),
      periodNumber: Number(budget.periodNumber)
    })) as IBudget[];

    return { documents: budgetsWithSpent };
  } catch (error) {
    console.error("Error fetching user budgets:", error);
    return { documents: [] };
  }
}

export async function getTotalSpentForCategory(
  userId: string,
  category: string,
  startDate: string | Date,
  endDate: string | Date
) {
  const start = new Date(startDate).toISOString();
  const end = new Date(endDate).toISOString();

  const spent = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.transactionsCollectionId,
    [
      Query.equal("creator", userId),
      Query.equal("category", category),
      Query.greaterThanEqual("date", start),
      Query.lessThanEqual("date", end),
    ]
  );

  return spent.documents.reduce((acc, curr) => acc + curr.amount, 0);
}

export async function getCategoryWiseSpending(userId: string, start: Date, end: Date, categories: string[]) {
  const results = await Promise.all(
    categories.map(async (category) => {
      const total = await getTotalSpentForCategory(userId, category, start, end);
      return { category, total };
    })
  );

  // Filter out categories with zero spending
  return results.filter(item => item.total > 0);
}


export async function getAllTransactions(userId?: string): Promise<TransactionsResponse> {
  if (!userId) return { documents: [], total: 0 };

  try {
    const transactions = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.transactionsCollectionId,
      [
        Query.equal("creator", userId),
        Query.orderDesc("date")
      ]
    );

    return {
      documents: transactions.documents as ITransaction[],
      total: transactions.total
    };
  } catch (error) {
    console.log(error);
    return { documents: [], total: 0 };
  }
}

export function groupTransactionsByDay(transactions: { amount: number; date: string, type: string}[] = []) {
  const grouped: Record<string, { income: number; expense: number }> = {};

  // If no transactions, return empty data for all days
  if (!transactions || transactions.length === 0) {
    return Array.from({ length: 31 }, (_, i) => {
      const day = (i + 1).toString();
      return {
        day,
        income: 0,
        expense: 0,
      };
    });
  }

  transactions.forEach((tx) => {
    try {
      if (!tx || !tx.date || !tx.type || !tx.amount) return;
      
      const date = new Date(tx.date);
      if (isNaN(date.getTime())) return; // Skip invalid dates
      
      const day = date.getDate().toString(); // 1 to 31
      const amount = Number(tx.amount) || 0;

      if (!grouped[day]) {
        grouped[day] = { income: 0, expense: 0 };
      }

      if (tx.type === "income") {
        grouped[day].income += amount;
      } else if (tx.type === "expense") {
        grouped[day].expense += amount;
      }
    } catch (error) {
      console.warn('Error processing transaction:', tx, error);
    }
  });

  // Prepare array for Recharts
  return Array.from({ length: 31 }, (_, i) => {
    const day = (i + 1).toString();
    return {
      day,
      income: grouped[day]?.income || 0,
      expense: grouped[day]?.expense || 0,
    };
  });
}

export function groupTransactionsByWeek(transactions: { amount: number; date: string, type: string }[]) {
  const grouped: Record<string, { income: number; expense: number }> = {};

  transactions.forEach((tx) => {
    const date = new Date(tx.date);
    const week = `Week ${Math.ceil(date.getDate() / 7)}`;

    if (!grouped[week]) grouped[week] = { income: 0, expense: 0 };

    if (tx.type === "income") {
      grouped[week].income += tx.amount;
    } else {
      grouped[week].expense += tx.amount;
    }
  });

  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
  return weeks.map((week) => ({
    day: week,
    income: grouped[week]?.income || 0,
    expense: grouped[week]?.expense || 0,
  }));
}

export function groupTransactionsByMonth(transactions: { amount: number; date: string, type: string}[] = []) {
  // Initialize an array of all months with their short names
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Create a map to store the data for each month
  const monthData = new Map(months.map(month => [month, { income: 0, expense: 0 }]));

  // Get current year
  const currentYear = new Date().getFullYear();

  // If no transactions, return empty data for all months
  if (!transactions || transactions.length === 0) {
    return months.map(month => ({
      day: month,
      income: 0,
      expense: 0
    }));
  }

  // Process each transaction
  transactions.forEach(tx => {
    try {
      if (!tx || !tx.date || !tx.type || !tx.amount) return;
      
      const date = new Date(tx.date);
      if (isNaN(date.getTime())) return; // Skip invalid dates
      
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        const monthKey = months[monthIndex];
        
        if (monthData.has(monthKey)) {
          const currentData = monthData.get(monthKey)!;
          const amount = Number(tx.amount) || 0;
          
          if (tx.type === "income") {
            currentData.income += amount;
          } else if (tx.type === "expense") {
            currentData.expense += amount;
          }
          monthData.set(monthKey, currentData);
        }
      }
    } catch (error) {
      console.warn('Error processing transaction:', tx, error);
    }
  });

  // Convert the map to the required array format
  return months.map(month => ({
    day: month,
    income: monthData.get(month)?.income || 0,
    expense: monthData.get(month)?.expense || 0
  }));
}

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY); // use your environment variable

export async function scanReceipt(file: File) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    const prompt = `
      You are an expert in analyzing receipt data.
      
      Extract the following from this receipt image:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }
      If not a receipt, return {}.
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

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    const data = JSON.parse(cleanedText);
    return data;
  } catch (err) {
    console.error("Failed to scan receipt:", err);
    throw err;
  }
}

export type TimeRange = 'week' | 'month' | 'year';

export function getDateRange(range: TimeRange) {
  const now = new Date();
  const start = new Date();

  switch (range) {
    case 'week':
      start.setDate(now.getDate() - now.getDay());
      break;
    case 'month':
      start.setDate(1);
      break;
    case 'year':
      start.setMonth(0, 1);
      break;
  }

  return { start, end: now };
}

export async function getCashFlow(userId: string, range: TimeRange) {
  const { start, end } = getDateRange(range);
  
  const transactions = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.transactionsCollectionId,
    [
      Query.equal("creator", userId),
      Query.greaterThanEqual("date", start.toISOString()),
      Query.lessThanEqual("date", end.toISOString()),
    ]
  );

  const cashFlow = {
    income: 0,
    expense: 0,
    total: 0
  };

  transactions.documents.forEach((tx: any) => {
    if (tx.type === 'income') {
      cashFlow.income += tx.amount;
    } else {
      cashFlow.expense += tx.amount;
    }
  });

  cashFlow.total = cashFlow.income - cashFlow.expense;
  return cashFlow;
}

export async function getCategoryWiseData(userId: string, range: TimeRange, type: 'income' | 'expense') {
  const { start, end } = getDateRange(range);
  
  try {
    const transactions = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.transactionsCollectionId,
      [
        Query.equal("creator", userId),
        Query.equal("type", type),
        Query.greaterThanEqual("date", start.toISOString()),
        Query.lessThanEqual("date", end.toISOString()),
      ]
    );

    const categoryTotals: Record<string, number> = {};

    transactions.documents.forEach((tx: any) => {
      const category = tx.category;
      if (category) {
        categoryTotals[category] = (categoryTotals[category] || 0) + Number(tx.amount);
      }
    });

    return Object.entries(categoryTotals)
      .map(([category, total]) => ({
        category,
        total
      }))
      .sort((a, b) => b.total - a.total);
  } catch (error) {
    console.error('Error in getCategoryWiseData:', error);
    return [];
  }
}

export async function uploadFile(file: File) {
  try {
    const fileId = ID.unique();
    await storage.createFile(
      appwriteConfig.storageId,
      fileId,
      file
    );
    
    const fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);
    return { fileId, fileUrl: fileUrl.toString() };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export async function searchTransactions(userId: string, search: string, timeFilter: 'all' | 'week' | 'month' | 'year' = 'all') {
  try {
    const queries: any[] = [Query.equal("creator", userId)];

    // Add date filter based on timeFilter
    if (timeFilter !== 'all') {
      const now = new Date();
      const startDate = new Date();

      switch (timeFilter) {
        case 'week':
          startDate.setDate(now.getDate() - now.getDay());
          break;
        case 'month':
          startDate.setDate(1);
          break;
        case 'year':
          startDate.setMonth(0, 1);
          break;
      }

      queries.push(Query.greaterThanEqual("date", startDate.toISOString()));
      queries.push(Query.lessThanEqual("date", now.toISOString()));
    }

    // If search term is empty, return filtered transactions
    if (!search.trim()) {
      return await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.transactionsCollectionId,
        queries
      );
    }

    // Convert search term to lowercase for case-insensitive matching
    const searchTerm = search.toLowerCase();

    // Add contains queries for string fields
    const orFilters = [
      Query.contains("category", searchTerm),
      Query.contains("type", searchTerm),
      Query.contains("note", searchTerm)
    ];

    // Add amount search if the search term is a number
    if (!isNaN(Number(searchTerm))) {
      orFilters.push(Query.equal("amount", Number(searchTerm)));
    }

    queries.push(Query.or(orFilters));

    return await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.transactionsCollectionId,
      queries
    );
  } catch (error) {
    console.error("Error searching transactions:", error);
    return { documents: [] };
  }
}

