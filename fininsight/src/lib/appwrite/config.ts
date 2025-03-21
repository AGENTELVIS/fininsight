import { Client, Storage, Account, Avatars, Databases} from 'appwrite';;

export const appwriteConfig = {
    projectId: '6756e647000ac7ad8c5a', 
    url: 'https://cloud.appwrite.io/v1' ,
    databaseId: '6762c27500156d34563f',
    userCollectionId: '6762c29e000df86bf717',
    transactionsCollectionId: '67b88c97001e561cd21d',
    accountsCollectionId: '67cd53bb002c7c44f8e1',
    remindersCollectionId: '67641e3d00275032f4fb',
}

export const client = new Client();

client.setProject(appwriteConfig.projectId);
client.setEndpoint(appwriteConfig.url);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
