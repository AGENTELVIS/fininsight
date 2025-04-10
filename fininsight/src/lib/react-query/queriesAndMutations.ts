import { INewAccount, INewBudget, INewData, INewUser } from '@/types';
import { 
    createAccount, 
    createBudget, 
    createTransaction, 
    createUserAccount, 
    deleteAccount, 
    deleteTransaction, 
    getRecentTransactions, 
    getUserAccounts, 
    getUserBudgets, 
    getUserTransactions, 
    signInAccount, 
    signOutAccount, 
    updateAccount, 
    updateAccountBalance, 
    updateTransaction
} from '../appwrite/api';

import { 
    useQuery, 
    useMutation, 
    useQueryClient,  
} from '@tanstack/react-query';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Query_Keys } from './queryKeys';


export const useCreateUserAccount = () =>{
    return useMutation({
        mutationFn: (user: INewUser) => createUserAccount(user)
    })

}

export const useSignInAccount = () =>{
    return useMutation({
        mutationFn: (user: 
            {email: string; password: string;}
        ) => signInAccount(user)
    })
}

export const useSignOutAccount = () =>{
    return useMutation({
        mutationFn: signOutAccount
    });
}

export const useCreateTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (transaction : INewData) => createTransaction(transaction),
        onSuccess: () => {
            console.log("Transaction created successfully");
            queryClient.invalidateQueries({
                queryKey: [Query_Keys.GET_RECENT_TRANSACTIONS]
            }); // Refresh transaction data
        },
    });
};

export const useGetUserTransactions = (userId?: string) => {
    return useQuery({
      queryKey: [Query_Keys.GET_USER_TRANSACTIONS, userId],
      queryFn: () => getUserTransactions(userId),
      enabled: !!userId,
    });
  };
  
export const useGetRecentTransactions = () => {
    return useQuery({
        queryKey: [Query_Keys.GET_RECENT_TRANSACTIONS],
        queryFn: getRecentTransactions,
    })
}

 export const useCreateAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (account : INewAccount) => createAccount(account),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [Query_Keys.GET_USER_ACCOUNTS]
            }); 
        },
    });
};

export const useGetUserAccounts = (userId?: string) => {
    return useQuery({
      queryKey: [Query_Keys.GET_USER_ACCOUNTS, userId],
      queryFn: () => getUserAccounts(userId),
      enabled: !!userId,
    });
};

type UpdateAccountBalanceParams = {
    accountId: string;
    amount: number;
    type: string;
};

export const useUpdateAccountBalance = () => {
    const queryClient = useQueryClient();

    return useMutation(
        async ({ accountId, amount, type }: UpdateAccountBalanceParams) => 
            updateAccountBalance(accountId, amount, type),
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [Query_Keys.GET_USER_ACCOUNTS] });
                queryClient.invalidateQueries({ queryKey: [Query_Keys.GET_USER_TRANSACTIONS] });
            },
        }
    );
};

// ✅ Update Account
type UpdateAccountParams = {
    accountId: string;
    updatedData: {
        name: string;
        amount: number;
    };
};

export const useUpdateAccount = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ accountId, updatedData }: UpdateAccountParams) => 
            updateAccount(accountId, updatedData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [Query_Keys.GET_USER_ACCOUNTS] });
        },
    });
};


// ✅ Delete Account
export const useDeleteAccount = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: deleteAccount,
        onSuccess: () => {
            queryClient.invalidateQueries([Query_Keys.GET_USER_ACCOUNTS]);
        },
    });
};

export const useUpdateTransaction = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async ({ transactionId, updatedData }: { transactionId: string; updatedData: any }) =>
        updateTransaction(transactionId, updatedData),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [Query_Keys.GET_USER_TRANSACTIONS] });
      },
    });
    
};
  
export const useDeleteTransaction = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (transactionId: string) => deleteTransaction(transactionId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [Query_Keys.GET_USER_TRANSACTIONS] });
      },
    });
};
  
export const useCreateBudget = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (budget : INewBudget) => createBudget(budget),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [Query_Keys.GET_USER_BUDGETS]
            }); 
        },
    });
};

export const useGetUserBudgets = (userId?: string) => {
    return useQuery({
      queryKey: [Query_Keys.GET_USER_BUDGETS, userId],
      queryFn: () => getUserBudgets(userId),
      enabled: !!userId,
    });
};