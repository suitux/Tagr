'use client'

import { useState } from 'react'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const breakpoint = useBreakpoint()
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false
          }
        }
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {breakpoint === 'desktop' && <ReactQueryDevtools initialIsOpen={false} buttonPosition='bottom-left' />}
    </QueryClientProvider>
  )
}
