import { ID, Query } from "appwrite";

import { INewUser, INewData, INewAccount } from "@/types";
import { avatars,account,appwriteConfig,databases } from "./config";

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
    const currentAccount = await getAccount();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
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
    const formattedDate = new Date(transaction.date).toISOString()

    const newTransaction = databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.transactionsCollectionId,
      ID.unique(),
      {
        creator: transaction.userId,
        amount: transaction.amount,
        category: transaction.category,
        note: transaction.note,
        date: formattedDate,
        type: transaction.type,
        account: transaction.account,
      }
    );

    return newTransaction;
  } catch (error) {
    console.log(error);
  }
}



export async function getUserTransactions(userId?: string) {
  if (!userId) return;

  try {
    const userTransactions = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.transactionsCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!userTransactions) throw Error;

    return userTransactions;
  } catch (error) {
    console.log(error);
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
    });

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

    if (!userAccounts) throw Error;

    return userAccounts;
  } catch (error) {
    console.log(error);
    return { documents: [] };
  }
} 

