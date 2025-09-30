import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPriceByUserType } from '@/lib/pricing';

export const useWishlistProducts = (productIds: string[]) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productIds.length > 0) {
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [productIds, user?.userType]);

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

      const productPromises = productIds.map(async (productId) => {
        try {
          const response = await fetch(`https://api.dharaniherbbals.com/api/product-masters/${productId}`, {
            headers: { 'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}` }
          });
          
          if (!response.ok) return null;
          
          const data = await response.json();
          const product = data.data || data;
          
          if (product) {
            const attrs = product.attributes;
            
            if (attrs.status === false) return null;
            
            let price = getPriceByUserType(attrs, userType);
            let productName = attrs.Name || attrs.name;
            let productImage = attrs.photo || attrs.image;
            let priceRange = null;
            
            // Handle variable products - show price range
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
              } catch (e) {
                console.error('Error parsing variations:', e);
              }
            }
            
            return {
              id: product.id,
              skuid: attrs.skuid || product.id,
              originalProductId: productId,
              name: productName,
              price,
              priceRange,
              image: productImage,
              category: attrs.category,
              tamil: attrs.tamil
            };
          }
        } catch (e) {
          console.error('Error fetching wishlist product:', e);
        }
        return null;
      });

      const results = await Promise.all(productPromises);
      const validProducts = results.filter(Boolean);
      console.log('Wishlist products fetched:', validProducts.length, validProducts);
      setProducts(validProducts);
    } catch (error) {
      console.error('Error fetching wishlist products:', error);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading };
};