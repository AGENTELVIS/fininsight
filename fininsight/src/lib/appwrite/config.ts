import { Client, Storage, Account, Avatars, Databases} from 'appwrite'


export const appwriteConfig = {
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    url: import.meta.env.VITE_APPWRITE_URL,
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    userCollectionId: import.meta.env.VITE_APPWRITE_USERS_ID,
    transactionsCollectionId: import.meta.env.VITE_APPWRITE_TRANSACTIONS_ID,
    remindersCollectionId: import.meta.env.VITE_APPWRITE_REMINDERS_ID,
}

export const client = new Client();

client.setProject(appwriteConfig.projectId);
client.setEndpoint(appwriteConfig.url);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
