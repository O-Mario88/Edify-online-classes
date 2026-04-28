import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { ApiResult } from '@/api/client';

/**
 * Thin wrapper around React Query. Unwraps our `ApiResult<T>` shape
 * so screens can treat the data as the real payload (or null) without
 * having to peel the error layer off in every consumer.
 */
export function useApiQuery<T>(
  key: readonly unknown[],
  fetcher: () => Promise<ApiResult<T>>,
  options?: Omit<UseQueryOptions<T | null, Error, T | null>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<T | null, Error, T | null>({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await fetcher();
      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: 30_000,
    ...options,
  });
}
