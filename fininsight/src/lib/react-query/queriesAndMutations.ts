import { createAccount, createTransaction, createUserAccount, getRecentTransactions, getUserAccounts, getUserTransactions, signInAccount, signOutAccount } from '../appwrite/api'
import { INewAccount, INewData, INewUser } from '@/types'
import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery
} from '@tanstack/react-query'
import { Query_Keys } from './queryKeys'
import { databases } from '../appwrite/config'


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





