import { get } from './api';

export const getProducts = async (page = 1, pageSize = 10, filters = {}) => {
  const params = {
    'pagination[page]': page.toString(),
    'pagination[pageSize]': pageSize.toString(),
    'populate': '*'
  };
  
  // Add any filters
  Object.entries(filters).forEach(([key, value]) => {
    params[`filters[${key}][$eq]`] = value.toString();
  });
  
  return get('/products', params);
};

export const getProduct = async (id) => {
  return get(`/products/${id}`, { 'populate': '*' });
};

export const getProductsByCategory = async (categoryId, page = 1, pageSize = 10) => {
  return get('/products', {
    'pagination[page]': page.toString(),
    'pagination[pageSize]': pageSize.toString(),
    'filters[category][id][$eq]': categoryId,
    'populate': '*'
  });
};

export const searchProducts = async (query, page = 1, pageSize = 10) => {
  return get('/products', {
    'pagination[page]': page.toString(),
    'pagination[pageSize]': pageSize.toString(),
    'filters[name][$contains]': query,
    'populate': '*'
  });
};

export const getFeaturedProducts = async (limit = 6) => {
  return get('/products', {
    'pagination[limit]': limit.toString(),
    'filters[featured][$eq]': 'true',
    'populate': '*'
  });
};