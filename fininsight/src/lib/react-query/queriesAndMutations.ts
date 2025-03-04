import { createTransaction, createUserAccount, getRecentTransactions, signInAccount, signOutAccount } from '../appwrite/api'
import { INewData, INewUser } from '@/types'
import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery
} from '@tanstack/react-query'
import { Query_Keys } from './queryKeys'


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

export const useGetRecentTransactions = () => {
    return useQuery({
        queryKey: [Query_Keys.GET_RECENT_TRANSACTIONS],
        queryFn: getRecentTransactions,
    })
}


