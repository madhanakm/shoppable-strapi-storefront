import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPriceByUserType } from '@/lib/pricing';

export const useWishlistProducts = (skuIds: string[]) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (skuIds.length > 0) {
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [skuIds, user?.userType]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let userType = 'customer';
      if (user?.id) {
        const userResponse = await fetch(`https://api.dharaniherbbals.com/api/ecom-users/${user.id}`, {
          headers: { 'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}` }
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          userType = userData.data?.attributes?.userType || 'customer';
        }
      }

      const productPromises = skuIds.map(async (originalSkuid) => {
        try {
          const response = await fetch(`https://api.dharaniherbbals.com/api/product-masters?filters[skuid][$eq]=${originalSkuid}`, {
            headers: { 'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
              const product = data.data[0];
              const attrs = product.attributes;
              
              if (attrs.status === false) return null;
              
              let price = getPriceByUserType(attrs, userType);
              let priceRange = null;
              
              if (attrs.isVariableProduct && attrs.variations) {
                try {
                  const variations = typeof attrs.variations === 'string' ? JSON.parse(attrs.variations) : attrs.variations;
                  const prices = variations.map(v => getPriceByUserType(v, userType));
                  if (prices.length > 0) {
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    price = minPrice;
                    priceRange = minPrice === maxPrice ? null : `${minPrice} - ${maxPrice}`;
                  }
                } catch (e) {}
              }
              
              return {
                id: product.id,
                skuid: attrs.skuid,
                originalSkuid: originalSkuid,
                name: attrs.Name || attrs.name,
                price,
                priceRange,
                image: attrs.photo || attrs.image,
                category: attrs.category,
                tamil: attrs.tamil
              };
            }
          }
        } catch (e) {}
        return null;
      });

      const results = await Promise.all(productPromises);
      setProducts(results.filter(Boolean));
    } catch (error) {
      console.error('Error fetching wishlist products:', error);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading };
};