import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { get, post, put, del } from '@/services/api';

/**
 * Custom hook for GET requests using React Query
 */
export function useApiQuery<T>(
  key: string | string[],
  endpoint: string,
  params?: Record<string, string>,
  options?: Omit<UseQueryOptions<T, Error, T, string[]>, 'queryKey' | 'queryFn'>
) {
  const queryKey = Array.isArray(key) ? key : [key];
  
  return useQuery<T, Error>({
    queryKey,
    queryFn: () => get<T>(endpoint, params),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    ...options
  });
}

/**
 * Custom hook for POST requests using React Query
 */
export function useApiMutation<T, D = unknown>(
  endpoint: string,
  options?: Omit<UseMutationOptions<T, Error, D>, 'mutationFn'>
) {
  return useMutation<T, Error, D>({
    mutationFn: (data: D) => post<T>(endpoint, data),
    ...options
  });
}

/**
 * Custom hook for PUT requests using React Query
 */
export function useApiPutMutation<T, D = unknown>(
  endpoint: string,
  options?: Omit<UseMutationOptions<T, Error, D>, 'mutationFn'>
) {
  return useMutation<T, Error, D>({
    mutationFn: (data: D) => put<T>(endpoint, data),
    ...options
  });
}

/**
 * Custom hook for DELETE requests using React Query
 */
export function useApiDeleteMutation<T>(
  endpoint: string,
  options?: Omit<UseMutationOptions<T, Error, string>, 'mutationFn'>
) {
  return useMutation<T, Error, string>({
    mutationFn: (id: string) => del<T>(`${endpoint}/${id}`),
    ...options
  });
}