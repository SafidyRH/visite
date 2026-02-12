import { QueryClient } from '@tanstack/react-query'

/**
 * TanStack Query client configuration
 *
 * Default settings:
 * - staleTime: 1 minute - data is considered fresh for 1 minute
 * - gcTime: 5 minutes - unused data is garbage collected after 5 minutes
 * - retry: 1 - failed queries retry once before failing
 * - refetchOnWindowFocus: false - don't refetch when window regains focus
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
