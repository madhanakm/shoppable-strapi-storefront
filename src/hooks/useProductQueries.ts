import { useQuery } from '@tanstack/react-query';
import { getPriceByUserType } from '@/lib/pricing';
import { formatPrice } from '@/lib/utils';
import { getProductReviewStats, getBulkProductReviewStats } from '@/services/reviews';

const API_URL = 'https://api.dharaniherbbals.com/api';
const API_TOKEN = import.meta.env.VITE_STRAPI_API_TOKEN;

// Fetch single product by ID
export const useProduct = (productId: string | number, userType: string = 'customer') => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/product-masters/${productId}`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch product');

      const data = await response.json();
      const product = data.data || data;

      // Format product with pricing
      return {
        id: product.id,
        ...product.attributes,
        displayPrice: getPriceByUserType(product.attributes, userType),
        userType
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Fetch related products
export const useRelatedProducts = (category?: string, brand?: string, excludeId?: number, userType: string = 'customer') => {
  return useQuery({
    queryKey: ['relatedProducts', category, brand, excludeId, userType],
    queryFn: async () => {
      const fields = 'fields[0]=Name&fields[1]=skuid&fields[2]=mrp&fields[3]=resellerprice&fields[4]=customerprice&fields[5]=retailprice&fields[6]=sarvoprice&fields[7]=distributorprice&fields[8]=price&fields[9]=category&fields[10]=brand&fields[11]=tamil&fields[12]=isVariableProduct&fields[13]=variations';

      const formatProducts = (items: any[]) =>
        items
          .filter(p => p.id !== excludeId)
          .slice(0, 4)
          .map(p => ({
            id: p.id,
            name: p.attributes?.Name || p.attributes?.name,
            photo: '',
            displayPrice: getPriceByUserType(p.attributes, userType),
            ...p.attributes
          }));

      const fetchPhotos = async (formatted: any[]) => {
        const photosResult = await Promise.all(
          formatted.map(p =>
            fetch(`${API_URL}/product-masters/${p.id}?fields[0]=photo`, { headers: { 'Authorization': `Bearer ${API_TOKEN}` } })
              .then(r => r.ok ? r.json() : null)
              .then(d => ({ id: p.id, photo: d?.data?.attributes?.photo || '' }))
              .catch(() => ({ id: p.id, photo: '' }))
          )
        );
        const photoMap = Object.fromEntries(photosResult.map(p => [p.id, p.photo]));
        return formatted.map(p => ({ ...p, photo: photoMap[p.id] || '' }));
      };

      // Try category filter first
      if (category?.trim()) {
        const r = await fetch(
          `${API_URL}/product-masters?filters[category][$eq]=${encodeURIComponent(category.trim())}&filters[status][$eq]=true&${fields}&pagination[pageSize]=10`,
          { headers: { 'Authorization': `Bearer ${API_TOKEN}` } }
        );
        if (r.ok) {
          const data = await r.json();
          const formatted = formatProducts(data.data || []);
          if (formatted.length >= 2) return fetchPhotos(formatted);
        }
      }

      // Fallback: fetch random products
      const r = await fetch(
        `${API_URL}/product-masters?filters[status][$eq]=true&${fields}&pagination[pageSize]=20`,
        { headers: { 'Authorization': `Bearer ${API_TOKEN}` } }
      );
      if (!r.ok) return [];
      const data = await r.json();
      const shuffled = (data.data || []).sort(() => Math.random() - 0.5);
      const formatted = formatProducts(shuffled);
      return fetchPhotos(formatted);
    },
    staleTime: 1000 * 60 * 10,
    enabled: true,
  });
};

// Fetch product review stats
export const useProductReviewStats = (productId: number, skuId?: string) => {
  return useQuery({
    queryKey: ['reviewStats', productId, skuId],
    queryFn: async () => {
      return await getProductReviewStats(productId, skuId);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Fetch bulk review stats for multiple products
export const useBulkReviewStats = (productIds: number[]) => {
  return useQuery({
    queryKey: ['bulkReviewStats', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return {};
      return await getBulkProductReviewStats(productIds);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: productIds.length > 0,
  });
};

const PRODUCT_FIELDS = 'fields[0]=Name&fields[1]=skuid&fields[2]=mrp&fields[3]=resellerprice&fields[4]=customerprice&fields[5]=retailprice&fields[6]=sarvoprice&fields[7]=distributorprice&fields[8]=price&fields[9]=type&fields[10]=status&fields[11]=tamil&fields[12]=isVariableProduct&fields[13]=variations&fields[14]=category&fields[15]=newLaunch&fields[16]=stock';

const fetchProductPhoto = async (productId: number): Promise<string> => {
  const response = await fetch(
    `${API_URL}/product-masters/${productId}?fields[0]=photo`,
    { headers: { 'Authorization': `Bearer ${API_TOKEN}` } }
  );
  if (!response.ok) return '';
  const data = await response.json();
  return data.data?.attributes?.photo || '';
};

// Fetch best-selling products with proper formatting
export const useBestSellingProducts = (userType: string = 'customer', limit: number = 10) => {
  return useQuery({
    queryKey: ['bestSellingProducts', userType, limit],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/product-masters?filters[type][$eq]=Best Selling&filters[status][$eq]=true&pagination[pageSize]=${limit}&${PRODUCT_FIELDS}`,
        { headers: { 'Authorization': `Bearer ${API_TOKEN}` } }
      );

      if (!response.ok) throw new Error('Failed to fetch best-selling products');

      const data = await response.json();
      const products = (data.data || []).slice(0, limit);

      const formatted = products.map((p: any) => ({
        id: p.id,
        name: p.attributes?.Name || p.attributes?.name,
        image: '',
        displayPrice: getPriceByUserType(p.attributes, userType),
        priceRange: getPriceRange(p.attributes, userType),
        category: p.attributes?.category,
        skuId: p.attributes?.skuid || p.attributes?.SKUID || p.id.toString(),
        isVariableProduct: p.attributes?.isVariableProduct,
        ...p.attributes
      }));

      const productIds = formatted.map(p => p.id).filter((id: number) => !isNaN(id));
      let reviewStats = {};

      const [reviewStatsResult, ...photos] = await Promise.all([
        productIds.length > 0 ? getBulkProductReviewStats(productIds).catch(() => ({})) : Promise.resolve({}),
        ...formatted.map((p: any) => fetchProductPhoto(p.id))
      ]);

      reviewStats = reviewStatsResult;
      formatted.forEach((p: any, i: number) => { p.image = photos[i] || ''; });

      return { products: formatted, reviewStats };
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });
};

// Fetch new launch products
export const useNewLaunchProducts = (userType: string = 'customer', limit: number = 5) => {
  return useQuery({
    queryKey: ['newLaunchProducts', userType, limit],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/product-masters?filters[newLaunch][$eq]=true&filters[status][$eq]=true&pagination[pageSize]=${limit}&${PRODUCT_FIELDS}`,
        { headers: { 'Authorization': `Bearer ${API_TOKEN}` } }
      );

      if (!response.ok) throw new Error('Failed to fetch new launch products');

      const data = await response.json();
      const products = (data.data || []).slice(0, limit);

      const formatted = products.map((p: any) => ({
        id: p.id,
        name: p.attributes?.Name || p.attributes?.name,
        image: '',
        displayPrice: getPriceByUserType(p.attributes, userType),
        priceRange: getPriceRange(p.attributes, userType),
        category: p.attributes?.category,
        skuId: p.attributes?.skuid || p.attributes?.SKUID || p.id.toString(),
        isVariableProduct: p.attributes?.isVariableProduct,
        ...p.attributes
      }));

      const productIds = formatted.map(p => p.id).filter((id: number) => !isNaN(id));

      const [reviewStatsResult, ...photos] = await Promise.all([
        productIds.length > 0 ? getBulkProductReviewStats(productIds).catch(() => ({})) : Promise.resolve({}),
        ...formatted.map((p: any) => fetchProductPhoto(p.id))
      ]);

      formatted.forEach((p: any, i: number) => { p.image = photos[i] || ''; });

      return { products: formatted, reviewStats: reviewStatsResult };
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });
};

// Helper function to calculate price range
const getPriceRange = (attributes: any, userType: string): string | null => {
  if (!attributes.isVariableProduct || !attributes.variations) return null;

  try {
    const variations = typeof attributes.variations === 'string'
      ? JSON.parse(attributes.variations)
      : attributes.variations;

    const prices = variations.map((v: any) => getPriceByUserType(v, userType));

    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      return minPrice === maxPrice
        ? formatPrice(minPrice)
        : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
    }
  } catch (error) {
    console.error('Error calculating price range:', error);
  }

  return null;
};
