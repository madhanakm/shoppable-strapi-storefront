import { getCategories } from './categories';
import { Category } from '@/types/strapi';

/**
 * Get only categories data in a simplified format
 * This can be used when you need just the category information without the Strapi wrapper
 */
export const getCategoriesOnly = async (): Promise<{id: number, name: string, slug: string}[]> => {
  try {
    const response = await getCategories();
    
    // Extract only the category data from the Strapi response
    return response.data.map(item => ({
      id: item.id,
      name: item.attributes.name,
      slug: item.attributes.slug,
      description: item.attributes.description
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};