import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /** Data is fresh for 5 minutes */
      staleTime: 1000 * 60 * 5,
      /** Keep in cache for 1 hour after last subscriber unmounts */
      gcTime: 1000 * 60 * 60,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
