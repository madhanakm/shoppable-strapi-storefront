import { useState, useEffect, useCallback } from 'react';
import { getPriceByUserType } from '@/lib/pricing';
import { formatPrice } from '@/lib/utils';
import { getBulkProductReviewStats } from '@/services/reviews';

const PRODUCT_FIELDS = 'fields[0]=Name&fields[1]=skuid&fields[2]=mrp&fields[3]=resellerprice&fields[4]=customerprice&fields[5]=retailprice&fields[6]=sarvoprice&fields[7]=distributorprice&fields[8]=price&fields[9]=type&fields[10]=status&fields[11]=tamil&fields[12]=isVariableProduct&fields[13]=variations&fields[14]=category&fields[15]=newLaunch';
const API_TOKEN = import.meta.env.VITE_STRAPI_API_TOKEN;

const fetchProductPhoto = async (productId: number): Promise<string> => {
  const response = await fetch(
    `https://api.dharaniherbbals.com/api/product-masters/${productId}?fields[0]=photo`,
    { headers: { 'Authorization': `Bearer ${API_TOKEN}` } }
  );
  if (!response.ok) return '';
  const data = await response.json();
  return data.data?.attributes?.photo || '';
};

// Cache with proper structure
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

// User type cache
let userTypeCache: string | null = null;

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const fetchUserType = async (): Promise<string> => {
  if (userTypeCache) return userTypeCache;
  
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      const response = await fetch(`https://api.dharaniherbbals.com/api/ecom-users/${userData.id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.data?.attributes?.userType) {
          userTypeCache = result.data.attributes.userType;
          return userTypeCache;
        }
      }
    }
  } catch (error) {
    console.error('Error fetching user type:', error);
  }
  
  userTypeCache = 'customer';
  return userTypeCache;
};

export const useOptimizedProducts = (apiUrl: string, cacheKey: string, limit: number = 10) => {
  const [products, setProducts] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatProducts = useCallback((productList: any[], userType: string) => {
    return productList.slice(0, limit).map((item: any) => {
      const attributes = item.attributes || item;
      
      let price = getPriceByUserType(attributes, userType);
      let priceRange = null;
      
      // Handle variable products properly
      if (attributes.isVariableProduct && attributes.variations) {
        try {
          const variations = typeof attributes.variations === 'string' 
            ? JSON.parse(attributes.variations) 
            : attributes.variations;
          const prices = variations.map((variation: any) => getPriceByUserType(variation, userType));
          
          if (prices.length > 0) {
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            price = minPrice;
            priceRange = minPrice === maxPrice 
              ? formatPrice(minPrice) 
              : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
          }
        } catch (e) {
          console.error('Error parsing variations:', e);
        }
      }
      
      return {
        id: item.id,
        name: attributes.Name || attributes.name || 'Product',
        tamil: attributes.tamil || null,
        price: price,
        priceRange: priceRange,
        image: attributes.photo || attributes.image || 'https://via.placeholder.com/300x300?text=Product',
        category: attributes.category || 'General',
        skuid: attributes.skuid || attributes.SKUID || item.id.toString(),
        isVariableProduct: attributes.isVariableProduct,
        variations: attributes.variations,
        userType: userType
      };
    });
  }, [limit]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setProducts(cachedData.products);
        setReviewStats(cachedData.reviewStats);
        setLoading(false);
        return;
      }

      // Fetch user type and products in parallel
      const [userType, response] = await Promise.all([
        fetchUserType(),
        fetch(`${apiUrl}&pagination[pageSize]=${limit}&${PRODUCT_FIELDS}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_TOKEN}` },
        })
      ]);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const data = await response.json();
      const formattedProducts = formatProducts(data.data || [], userType);
      
      // Fetch review stats and photos in parallel
      let reviewStatsData = {};
      const productIds = formattedProducts
        .map((p: any) => parseInt(p.id))
        .filter((id: number) => !isNaN(id));
      
      const [reviewResult, ...photos] = await Promise.all([
        productIds.length > 0 ? getBulkProductReviewStats(productIds).catch(() => ({})) : Promise.resolve({}),
        ...formattedProducts.map((p: any) => fetchProductPhoto(p.id))
      ]);
      reviewStatsData = reviewResult;
      formattedProducts.forEach((p: any, i: number) => { p.image = photos[i] || ''; });
      
      // Cache the results
      setCachedData(cacheKey, {
        products: formattedProducts,
        reviewStats: reviewStatsData
      });
      
      setProducts(formattedProducts);
      setReviewStats(reviewStatsData);
    } catch (err) {
      console.error(`Error fetching ${cacheKey}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, cacheKey, formatProducts, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { products, reviewStats, loading, error };
};

// Specific hooks for different product types
export const useNewLaunchProducts = () => {
  return useOptimizedProducts(
    'https://api.dharaniherbbals.com/api/product-masters?filters[newLaunch][$eq]=true&filters[status][$eq]=true',
    'newLaunchProducts',
    5 // Only 5 for New Launch
  );
};

export const useBestSellingProducts = () => {
  return useOptimizedProducts(
    'https://api.dharaniherbbals.com/api/product-masters?filters[type][$eq]=Best Selling&filters[status][$eq]=true',
    'bestSellingProducts',
    10 // 10 for Best Selling
  );
};