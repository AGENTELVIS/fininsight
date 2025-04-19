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

export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailPasswordSession(user.email, user.password);

    const currentUser = await getCurrentUser();

    
    if(!currentUser) throw new Error("user is not authenticated")

    return session;
  } catch (error) {
    console.log(error);
  }
}

export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    console.log(error);
  }
}


export async function getCurrentUser() {
  try {
    let currentAccount = await getAccount();

    if (!currentAccount) {
      console.warn("User not logged in, attempting session refresh...");

      try {
        await account.getSession("current");
        currentAccount = await getAccount();
      } catch (refreshError) {
        console.warn("Session refresh failed:", refreshError);
        return null;
      }
    }

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

    return null; 
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
    
    const budgets = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.budgetCollectionId,
      [
        Query.equal("creator", userId),
        Query.equal("category", category)
      ]
    );

    
    for (const budget of budgets.documents) {
      try {
        const currentSpent = Number(budget.spent || 0);
        let newSpent = currentSpent;
        
        if (type === "expense") {
          newSpent = currentSpent + amount;
        } else if (type === "income") {
          newSpent = currentSpent - amount;
        }
        
        
        newSpent = Math.max(0, newSpent);
        
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.budgetCollectionId,
          budget.$id,
          { spent: newSpent }
        );
      } catch (err) {
        console.warn(`Failed to update budget ${budget.$id}:`, err);
        
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

export async function createAccount(account: INewAccount){
  try {
    const newAccount = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.accountsCollectionId,
      ID.unique(),
      {
        creator: account.userId,
        name: account.name,
        amount: account.amount,
        isDefault: account.isDefault || false
      }
    );

    return newAccount;
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
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

    return userAccounts ?? { documents: [] }; 
  } catch (error) {
    console.log(error);
    return { documents: [] }; 
  }
}


export async function updateAccountBalance(accountId: string, amount: number, type: string) {
  try {
    if (!accountId) {
      throw new Error("Invalid account ID");
    }

    
    const account = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.accountsCollectionId,
      accountId
    );

    if (!account) throw new Error("Account not found");

    
    let currentBalance = Number(account.amount);
    let transactionAmount = Number(amount);

    let updatedBalance = currentBalance;
    if (type === "income") {
      updatedBalance += transactionAmount;
    } else if (type === "expense") {
      updatedBalance -= transactionAmount;
    }
    
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.accountsCollectionId,
      accountId,
      { amount: updatedBalance }
    );

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
    
    const transactions = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.transactionsCollectionId,
      [Query.equal("account", accountId)]
    );

    
    for (const transaction of transactions.documents) {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.transactionsCollectionId,
        transaction.$id
      );
    }
 
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
    
    const existingTransaction = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.transactionsCollectionId,
      transactionId
    );

    if (!existingTransaction) throw new Error("Transaction not found");

    
    const oldValues = {
      accountId: existingTransaction.account,
      amount: Number(existingTransaction.amount),
      type: existingTransaction.type,
      category: existingTransaction.category
    };

    const newValues = {
      accountId: updatedData.account ?? oldValues.accountId,
      amount: Number(updatedData.amount ?? oldValues.amount),
      type: updatedData.type ?? oldValues.type,
      category: updatedData.category ?? oldValues.category
    };

    
    const changes = {
      account: oldValues.accountId !== newValues.accountId,
      type: oldValues.type !== newValues.type,
      amount: oldValues.amount !== newValues.amount,
      category: oldValues.category !== newValues.category
    };

    
    if (changes.account) {
      
      await updateAccountBalance(
        oldValues.accountId,
        oldValues.amount,
        oldValues.type === "income" ? "expense" : "income"
      );
      
      await updateAccountBalance(
        newValues.accountId,
        newValues.amount,
        newValues.type
      );
    } else if (changes.type && oldValues.amount === newValues.amount) {
      
      await updateAccountBalance(
        oldValues.accountId,
        oldValues.amount * 2,
        newValues.type
      );
    } else if (changes.type) {
      
      await updateAccountBalance(
        oldValues.accountId,
        oldValues.amount,
        oldValues.type === "income" ? "expense" : "income"
      );
      await updateAccountBalance(
        oldValues.accountId,
        newValues.amount,
        newValues.type
      );
    } else if (changes.amount) {
     
      const diff = newValues.amount - oldValues.amount;
      const effectiveType = diff > 0 ? newValues.type : (newValues.type === "income" ? "expense" : "income");
      await updateAccountBalance(
        oldValues.accountId,
        Math.abs(diff),
        effectiveType
      );
    }

    
    if (changes.category || changes.amount || changes.type) {
      
      if (oldValues.type === "expense") {
        await updateBudgetSpent(
          existingTransaction.creator,
          oldValues.category,
          oldValues.amount,
          "income" 
        );
      }
      
      
      if (newValues.type === "expense") {
        await updateBudgetSpent(
          existingTransaction.creator,
          newValues.category,
          newValues.amount,
          "expense" 
        );
      }
    }


    const updatedTransaction = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.transactionsCollectionId,
      transactionId,
      updatedData
    );
    
    return updatedTransaction;
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw error;
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

export function calculateEndDate(startDate: Date, period: string, periodNumber: number): Date {
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
    const startDate = budget.startDate ?? new Date(); 
    const endDate = calculateEndDate(startDate, budget.period, budget.periodNumber);

    const newBudget = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.budgetCollectionId,
      ID.unique(),
      {
        creator: budget.creator,
        category: budget.category,
        amount: budget.amount,
        period: budget.period,
        periodNumber: budget.periodNumber,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        spent: 0, 
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
      if (isNaN(date.getTime())) return; 
      
      const day = date.getDate().toString(); 
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

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthData = new Map(months.map(month => [month, { income: 0, expense: 0 }]));
  const currentYear = new Date().getFullYear();
  
  if (!transactions || transactions.length === 0) {
    return months.map(month => ({
      day: month,
      income: 0,
      expense: 0
    }));
  }

  transactions.forEach(tx => {
    try {
      if (!tx || !tx.date || !tx.type || !tx.amount) return;
      
      const date = new Date(tx.date);
      if (isNaN(date.getTime())) return; 
      
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

  return months.map(month => ({
    day: month,
    income: monthData.get(month)?.income || 0,
    expense: monthData.get(month)?.expense || 0
  }));
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

    if (!search.trim()) {
      return await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.transactionsCollectionId,
        queries
      );
    }

    const searchTerm = search.toLowerCase();

    const orFilters = [
      Query.contains("category", searchTerm),
      Query.contains("type", searchTerm),
      Query.contains("note", searchTerm)
    ];

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

export async function updateBudget(budgetId: string, updatedData: Partial<INewBudget>) {
  try {
    
    const existingBudget = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.budgetCollectionId,
      budgetId
    );

    if (!existingBudget) throw new Error("Budget not found");

    let endDate = existingBudget.endDate;
    if (updatedData.period || updatedData.periodNumber) {
      const startDate = updatedData.startDate ? new Date(updatedData.startDate) : new Date(existingBudget.startDate);
      const period = updatedData.period || existingBudget.period;
      const periodNumber = updatedData.periodNumber || existingBudget.periodNumber;
      endDate = calculateEndDate(startDate, period, periodNumber).toISOString();
    }

    const updatedBudget = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.budgetCollectionId,
      budgetId,
      {
        ...updatedData,
        endDate,
        spent: existingBudget.spent,
      }
    );

    return updatedBudget;
  } catch (error) {
    console.error("Error updating budget:", error);
    throw error;
  }
}

export async function deleteBudget(budgetId: string) {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.budgetCollectionId,
      budgetId
    );
  } catch (error) {
    console.error("Error deleting budget:", error);
  }
}