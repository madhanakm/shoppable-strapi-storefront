import { useQuery } from '@tanstack/react-query';

const API_URL = 'https://api.dharaniherbbals.com/api';

/**
 * Custom hook to fetch and cache user type (customer, dealer, distributor, etc.)
 * Uses React Query for automatic caching and deduplication
 * Default to 'customer' for non-logged-in users
 */
export const useUserType = () => {
  return useQuery({
    queryKey: ['userType'],
    queryFn: async (): Promise<string> => {
      try {
        const storedUser = localStorage.getItem('user');

        if (!storedUser) {
          return 'customer';
        }

        const userData = JSON.parse(storedUser);

        if (!userData.id) {
          return 'customer';
        }

        const response = await fetch(`${API_URL}/ecom-users/${userData.id}`);

        if (!response.ok) {
          return 'customer';
        }

        const result = await response.json();
        const userType = result.data?.attributes?.userType || 'customer';

        return userType;
      } catch (error) {
        console.error('Error fetching user type:', error);
        return 'customer';
      }
    },
    staleTime: 1000 * 60 * 60, // 60 minutes - user type doesn't change often
    gcTime: 1000 * 60 * 60 * 2, // Keep in cache for 2 hours
    retry: 1,
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false, // Don't refetch on reconnect
  });
};
