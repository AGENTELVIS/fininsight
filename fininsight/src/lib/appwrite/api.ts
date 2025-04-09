import { ID, Query } from "appwrite";
import { INewUser, INewData, INewAccount, INewBudget } from "../../types/index.ts";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";
import { account, appwriteConfig} from "./config.js";
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



export async function createTransaction(transaction : INewData){
  console.log("Calling updateAccountBalance from createTransaction");
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated");

    if (!transaction.date) throw new Error("Transaction must have a date");

    const formattedDate = new Date(transaction.date).toISOString();
      
    const newTransaction = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.transactionsCollectionId,
      ID.unique(),
      {
        creator: transaction.userId,
        amount: transaction.amount,
        category: transaction.category,
        note: transaction.note || "",
        date: formattedDate,
        type: transaction.type,
        account: transaction.account,
        isRecurring: transaction.isRecurring || false,
        interval: transaction.isRecurring ? transaction.interval : null,
        enddate: transaction.isRecurring ? transaction.enddate : null,
      }
    );
    console.log("Calling updateAccountBalance from createTransaction");
    console.log("Updating balance for account:", account);

    if(!transaction.isRecurring){
      await updateAccountBalance(transaction.account, transaction.amount, transaction.type);
    }

    return newTransaction;
  } catch (error) {
    console.log(error);
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
        startDate: startDate.toISOString(), // make sure it's stored as ISO string
        endDate: endDate.toISOString(),
      }
    );

    return newBudget;
  } catch (error) {
    console.log(error);
  }
}


export async function getUserBudgets(userId?: string) {
  if (!userId) return {documents: []};

  try {
    const userAccounts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.budgetCollectionId,
      [Query.equal("creator", userId)]
    );

    return userAccounts ?? { documents: [] }; // Ensure it's never `undefined`
  } catch (error) {
    console.log(error);
    return { documents: [] }; // Prevent infinite loading
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


export async function getCurrentMonthTransactions(userId?:string){
  if (!userId) return {documents: []};

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const monthlyTransactions = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.transactionsCollectionId,
      [
        Query.equal("creator", userId),
        Query.greaterThanEqual("date", startOfMonth),
        Query.lessThanEqual("date", endOfMonth),
      ]
    );

    return monthlyTransactions ?? { documents: [] };
  } catch (error) {
    console.log(error);
    return { documents: [] };
  }
}

export function groupTransactionsByDay(transactions: { amount: number; date: string, type:string}[]) {
  const grouped: Record<string, { income: number; expense: number }> = {};

  transactions.forEach((tx) => {
    const date = new Date(tx.date);
    const day = date.getDate(); // 1 to 31

    if (!grouped[day]) {
      grouped[day] = { income: 0, expense: 0 };
    }

    if (tx.type === "income") {
      grouped[day].income += tx.amount;
    } else if (tx.type === "expense") {
      grouped[day].expense += tx.amount;
    }
  });

  
  // Prepare array for Recharts
  const data = Array.from({ length: 31 }, (_, i) => {
    const day = (i + 1).toString();
    return {
      day,
      income: grouped[day]?.income || 0,
      expense: grouped[day]?.expense || 0,
    };
  });

  return data;
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

export function groupTransactionsByMonth(transactions: { amount: number; date: string, type: string }[]) {
  const grouped: Record<string, { income: number; expense: number }> = {};

  transactions.forEach((tx) => {
    const date = new Date(tx.date);
    const month = date.toLocaleString("default", { month: "short" });

    if (!grouped[month]) grouped[month] = { income: 0, expense: 0 };

    if (tx.type === "income") {
      grouped[month].income += tx.amount;
    } else {
      grouped[month].expense += tx.amount;
    }
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map((month) => ({
    day: month,
    income: grouped[month]?.income || 0,
    expense: grouped[month]?.expense || 0,
  }));
}
