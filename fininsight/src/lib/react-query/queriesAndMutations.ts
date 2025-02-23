import { createTransaction, createUserAccount, signInAccount, signOutAccount } from '../appwrite/api'
import { INewData, INewUser } from '@/types'
import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery
} from '@tanstack/react-query'


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
            queryClient.invalidateQueries(["transactions"]); // Refresh transaction data
        },
    });
};


