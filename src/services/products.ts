import { get } from './api';

interface ProductFilters {
  category?: string;
  brand?: string;
  type?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface ProductSortOptions {
  sortBy?: 'name' | 'price-low' | 'price-high';
}

const PRODUCT_FIELDS = [
  'fields[0]=Name', 'fields[1]=skuid', 'fields[2]=mrp', 'fields[3]=resellerprice',
  'fields[4]=customerprice', 'fields[5]=retailprice', 'fields[6]=sarvoprice',
  'fields[7]=distributorprice', 'fields[8]=price', 'fields[9]=type', 'fields[10]=status',
  'fields[11]=tamil', 'fields[12]=isVariableProduct', 'fields[13]=variations',
  'fields[14]=category', 'fields[15]=newLaunch', 'fields[16]=brand'
];

export const getProducts = async (
  page = 1, 
  pageSize = 12, 
  filters: ProductFilters = {}, 
  sortOptions: ProductSortOptions = {}
) => {
  try {
    let queryParams = [...PRODUCT_FIELDS];
    
    queryParams.push(`pagination[page]=${page}`);
    queryParams.push(`pagination[pageSize]=${pageSize}`);
    queryParams.push('pagination[withCount]=true');
    
    if (filters.category && filters.category !== 'all') {
      queryParams.push(`filters[category][$eq]=${encodeURIComponent(filters.category)}`);
    }
    if (filters.brand && filters.brand !== 'all') {
      queryParams.push(`filters[brand][$eq]=${encodeURIComponent(filters.brand)}`);
    }
    if (filters.type && filters.type !== 'all') {
      if (filters.type === 'newLaunch') {
        queryParams.push(`filters[newLaunch][$eq]=true`);
      } else {
        queryParams.push(`filters[type][$eq]=${encodeURIComponent(filters.type)}`);
      }
    }
    if (filters.search) {
      const searchTerm = encodeURIComponent(filters.search);
      queryParams.push(`filters[Name][$containsi]=${searchTerm}`);
    }
    if (filters.minPrice !== undefined) {
      queryParams.push(`filters[mrp][$gte]=${filters.minPrice}`);
    }
    if (filters.maxPrice !== undefined) {
      queryParams.push(`filters[mrp][$lte]=${filters.maxPrice}`);
    }
    
    queryParams.push('filters[status][$eq]=true');
    
    if (sortOptions.sortBy === 'price-low') {
      // Client-side sort handles variable products correctly
    } else if (sortOptions.sortBy === 'price-high') {
      // Client-side sort handles variable products correctly
    }
    // No default sort — client will shuffle for random order
    
    const response = await fetch(
      `https://api.dharaniherbbals.com/api/product-masters?${queryParams.join('&')}`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProduct = async (id) => {
  return get(`/products/${id}`, { 'populate': '*' });
};

export const getProductsByCategory = async (categoryId, page = 1, pageSize = 10) => {
  return getProducts(page, pageSize, { category: categoryId });
};

export const searchProducts = async (query, page = 1, pageSize = 12, sortBy = 'name') => {
  return getProducts(page, pageSize, { search: query }, { sortBy });
};

export const getFeaturedProducts = async (limit = 6) => {
  return get('/products', {
    'pagination[limit]': limit.toString(),
    'filters[featured][$eq]': 'true',
    'populate': '*'
  });
};

export const getProductsWithPriceFilter = async (
  page = 1,
  pageSize = 12,
  minPrice?: number,
  maxPrice?: number,
  sortBy = 'name'
) => {
  const filters: ProductFilters = {};
  if (minPrice !== undefined) filters.minPrice = minPrice;
  if (maxPrice !== undefined) filters.maxPrice = maxPrice;
  
  return getProducts(page, pageSize, filters, { sortBy });
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