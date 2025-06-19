import { get, post, put, del } from './api';
import { Product, StrapiResponse, StrapiSingleResponse } from '@/types/strapi';

/**
 * Get all products with optional pagination and filtering
 */
export const getProducts = async (
  page = 1, 
  pageSize = 10,
  filters = {}
): Promise<StrapiResponse<Product>> => {
  const params: Record<string, string> = {
    'pagination[page]': page.toString(),
    'pagination[pageSize]': pageSize.toString(),
    'populate': 'image',
  };
  
  // Add any filters
  Object.entries(filters).forEach(([key, value]) => {
    params[`filters[${key}]`] = value as string;
  });
  
  return get<StrapiResponse<Product>>('/products', params);
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (limit = 6): Promise<StrapiResponse<Product>> => {
  return get<StrapiResponse<Product>>('/products', {
    'pagination[limit]': limit.toString(),
    'filters[featured]': 'true',
    'populate': 'image',
  });
};

/**
 * Get a single product by ID
 */
export const getProduct = async (id: string): Promise<StrapiSingleResponse<Product>> => {
  return get<StrapiSingleResponse<Product>>(`/products/${id}`, { 'populate': 'image' });
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (
  category: string,
  page = 1,
  pageSize = 10
): Promise<StrapiResponse<Product>> => {
  return get<StrapiResponse<Product>>('/products', {
    'pagination[page]': page.toString(),
    'pagination[pageSize]': pageSize.toString(),
    'filters[category][slug]': category,
    'populate': 'image',
  });
};

/**
 * Search products
 */
export const searchProducts = async (
  query: string,
  page = 1,
  pageSize = 10
): Promise<StrapiResponse<Product>> => {
  return get<StrapiResponse<Product>>('/products', {
    'pagination[page]': page.toString(),
    'pagination[pageSize]': pageSize.toString(),
    'filters[$or][0][name][$containsi]': query,
    'filters[$or][1][description][$containsi]': query,
    'populate': 'image',
  });
};