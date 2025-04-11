import { Client, Storage, Account, Avatars, Databases} from 'appwrite';;

export const appwriteConfig = {
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID, 
    url: 'https://cloud.appwrite.io/v1' ,
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID,
    userCollectionId: import.meta.env.VITE_APPWRITE_USERS_ID,
    transactionsCollectionId:import.meta.env.VITE_APPWRITE_TRANSACTIONS_ID,
    accountsCollectionId: import.meta.env.VITE_APPWRITE_ACCOUNTS_ID,
    budgetCollectionId: import.meta.env.VITE_APPWRITE_BUDGETS_ID,
}

export const client = new Client();
export const geminiAPIKey = import.meta.env.VITE_GEMINI_API_KEY;

client.setProject(appwriteConfig.projectId);
client.setEndpoint(appwriteConfig.url);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
