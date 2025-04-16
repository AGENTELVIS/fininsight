import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {ReactNode} from 'react'


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, 
      cacheTime: 1000 * 60 * 30, 
      refetchOnWindowFocus: false, 
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

