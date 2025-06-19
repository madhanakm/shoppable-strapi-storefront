import { get } from './api';
import { Category, StrapiResponse, StrapiSingleResponse } from '@/types/strapi';

/**
 * Get all categories
 */
export const getCategories = async (): Promise<StrapiResponse<Category>> => {
  return get<StrapiResponse<Category>>('/categories');
};

/**
 * Get a single category by slug
 */
export const getCategory = async (slug: string): Promise<StrapiSingleResponse<Category>> => {
  return get<StrapiSingleResponse<Category>>('/categories', {
    'filters[slug][$eq]': slug,
  });
};