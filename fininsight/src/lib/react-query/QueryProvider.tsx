import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {ReactNode} from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes (optional)
      refetchOnWindowFocus: false, // Optional: stops refetch on tab switch
    },
  },
});

export const QueryProvider = ({children}:{children:ReactNode}) => {
  return (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
  )
}

