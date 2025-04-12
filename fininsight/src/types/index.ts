export type IUpdateUser = {
    userId: string;
    name: string;
    username: string;
    email: string;
    imageId: string;
    imageUrl: URL | string;
    file: File[];
  };
  
  export type IUser = {
    id: string;
    name: string;
    username: string;
    email: string;
    imageId?: string;
    imageUrl?: string;
  };
  
  
  export type INewUser = {
    name: string;
    email: string;
    username: string;
    password: string;
  };

export type IContextType = {
    user: IUser;
    isLoading:boolean;
    setUser:React.Dispatch<React.SetStateAction<IUser>>;
    isAuthenticated: boolean;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
    checkAuthUser: () => Promise<boolean>;
};

export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type INewData = {
  userId: string;
  amount: number;
  category: string;
  note?: string;
  date: Date;
  type: string;
  account: string;
  imageId?: string;
  imageUrl?: string;
};

export type INewAccount = {
  userId: string;
  name: string;
  amount: number;
}

export type INewBudget = {
  creator: string;
  amount: number;
  category: string;
  period: string;
  periodNumber: number;
  startDate?: Date;
}

export type ExtractedData = {
  merchant?: string;
  total?: string;
  date?: string;
  category?: string;
};

export type IBudget = {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  creator: string;
  category: string;
  amount: number;
  spent: number;
  period: string;
  periodNumber: number;
  startDate: string;
  endDate: string;
};

export type ITransaction = {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  creator: string;
  amount: number;
  category: string;
  note?: string;
  date: string;
  type: string;
  account: string;
  imageId?: string;
  imageUrl?: string;
};

export type TransactionsResponse = {
  documents: ITransaction[];
  total: number;
};