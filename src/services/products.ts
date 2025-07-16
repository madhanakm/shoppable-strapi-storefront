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

export const getProductTamilName = async (productId) => {
  try {
    const response = await fetch(`https://api.dharaniherbbals.com/api/product-masters?filters[productId][$eq]=${productId}`);
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      return data.data[0].attributes?.tamil || null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching Tamil name:', error);
    return null;
  }
};

// Function to get product details from product master with user type
export const getProductMasterDetails = async (productId, userType = null) => {
  try {
    const response = await fetch(`https://api.dharaniherbbals.com/api/product-masters?filters[productId][$eq]=${productId}`);
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const productData = data.data[0];
      return {
        ...productData,
        userType
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching product master details:', error);
    return null;
  }
};

export const getProductsWithTamil = async (products) => {
  const productsWithTamil = await Promise.all(
    products.map(async (product) => {
      const tamilName = await getProductTamilName(product.id);
      return {
        ...product,
        tamilName
      };
    })
  );
  return productsWithTamil;
};