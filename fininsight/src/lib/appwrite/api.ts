import { ID, Query } from "appwrite";
import { INewUser, INewData, INewAccount } from "../../types/index.ts";

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
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated");

    if (!transaction.date) throw new Error("Transaction must have a date");

    const formattedDate = new Date(transaction.date).toISOString().split("T")[0];
      
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
      [Query.equal("creator", userId), Query.orderDesc("$createdAt"), Query.limit(8)]
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
