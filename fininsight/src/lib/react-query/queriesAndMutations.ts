import { INewAccount, INewBudget, INewData, INewUser, IUpdateUser, IBudget, ITransaction, TransactionsResponse } from '@/types';
import { 
    createAccount, 
    createBudget, 
    createTransaction, 
    createUserAccount, 
    deleteAccount, 
    deleteTransaction, 
    getCurrentUser, 
    getRecentTransactions, 
    getUserAccounts, 
    getUserBudgets, 
    getUserById, 
    getUserTransactions, 
    searchTransactions, 
    signInAccount, 
    signOutAccount, 
    updateAccount, 
    updateAccountBalance, 
    updateTransaction,
    updateUser,
    getAllTransactions,
    updateBudget,
    deleteBudget,
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

export const useGetCurrentUser = () => {
    return useQuery({
      queryKey: [Query_Keys.GET_CURRENT_USER],
      queryFn: getCurrentUser,
    });
  };

export const useGetUserById = (userId: string) => {
    return useQuery({
      queryKey: [Query_Keys.GET_USER_BY_ID, userId],
      queryFn: () => getUserById(userId),
      enabled: !!userId,
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (user: IUpdateUser) => updateUser(user),
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [Query_Keys.GET_CURRENT_USER],
        });
        queryClient.invalidateQueries({
          queryKey: [Query_Keys.GET_USER_BY_ID, data?.$id],
        });
      },
    });
  };

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
            });
            queryClient.invalidateQueries({
                queryKey: [Query_Keys.GET_USER_BUDGETS]
            });
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


type UpdateAccountParams = {
    accountId: string;
    updatedData: {
        name: string;
        amount: number;
        isDefault?: boolean;
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
    return useQuery<{ documents: IBudget[] }>({
        queryKey: [Query_Keys.GET_USER_BUDGETS, userId],
        queryFn: () => getUserBudgets(userId),
        enabled: !!userId,
        refetchInterval: false,
        refetchIntervalInBackground: true,
        staleTime: 1000 * 60 * 5,
    });
};

export const useSearchTransactions = (userId: string, searchTerm: string, timeFilter: 'all' | 'week' | 'month' | 'year' = 'all') => {
  return useQuery({
    queryKey: [Query_Keys.SEARCH_TRANSACTIONS, userId, searchTerm, timeFilter],
    queryFn: () => searchTransactions(userId, searchTerm, timeFilter),
    enabled: !!userId,
  });
};

export const useGetAllTransactions = (userId?: string) => {
  return useQuery<TransactionsResponse>({
    queryKey: [Query_Keys.GET_USER_TRANSACTIONS, userId, 'all'],
    queryFn: () => getAllTransactions(userId),
    enabled: !!userId,
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ budgetId, updatedData }: { budgetId: string; updatedData: Partial<INewBudget> }) =>
      updateBudget(budgetId, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Query_Keys.GET_USER_BUDGETS] });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budgetId: string) => deleteBudget(budgetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Query_Keys.GET_USER_BUDGETS] });
    },
  });
};
  