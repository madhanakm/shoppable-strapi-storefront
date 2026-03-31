import { get } from './api';
import { Category, StrapiResponse, StrapiSingleResponse } from '@/types/strapi';

/**
 * Get all categories
 */
export const getCategories = async (): Promise<StrapiResponse<Category>> => {
  return get<StrapiResponse<Category>>('/categories');
};

/**
 * Get product categories with images (photo fetched separately)
 */
export const getProductCategories = async () => {
  return get('/product-categories?fields[0]=Name&fields[1]=menuItem&fields[2]=status');
};

/**
 * Get active menu categories (menuItem: true) - no photo for speed
 */
export const getActiveMenuCategories = async () => {
  return get('/product-categories?filters[menuItem][$eq]=true&fields[0]=Name&fields[1]=menuItem');
};

/**
 * Get a single category by slug
 */
export const getCategory = async (slug: string): Promise<StrapiSingleResponse<Category>> => {
  return get<StrapiSingleResponse<Category>>('/categories', {
    'filters[slug][$eq]': slug,
  });
};