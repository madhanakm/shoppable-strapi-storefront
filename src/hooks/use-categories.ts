import { useQuery } from '@tanstack/react-query';
import { getCategoriesOnly } from '@/services/categoryApi';

/**
 * Custom hook to fetch only categories
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategoriesOnly(),
  });
}