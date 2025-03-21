export type IUser = {
    id: string;
    name: string;
    username: string;
    email: string;
    imageUrl: string;
    bio: string;
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
  type :string;
  account: string;
  isRecurring:Boolean;
  interval?:string;
  enddate?:Date;
};

export type INewAccount = {
  userId: string;
  name: string;
  amount: number;
}
