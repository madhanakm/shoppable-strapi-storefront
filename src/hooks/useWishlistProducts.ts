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
          // Try to find by product ID first
          let response = await fetch(`https://api.dharaniherbbals.com/api/product-masters/${productId}`, {
            headers: { 'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}` }
          });
          
          let product = null;
          let selectedVariation = null;
          
          if (response.ok) {
            const data = await response.json();
            product = data.data || data;
          }
          
          // Fallback: try to find by SKU if productId doesn't work (backward compatibility)
          if (!product) {
            response = await fetch(`https://api.dharaniherbbals.com/api/product-masters?filters[skuid][$eq]=${productId}`, {
              headers: { 'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}` }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.data && data.data.length > 0) {
                product = data.data[0];
              }
            }
          }
          
          if (product) {
            const attrs = product.attributes;
            
            if (attrs.status === false) return null;
            
            let price = getPriceByUserType(attrs, userType);
            let productName = attrs.Name || attrs.name;
            let productImage = attrs.photo || attrs.image;
            let priceRange = null;
            
            // Handle variable products
            if (attrs.isVariableProduct && attrs.variations) {
              try {
                const variations = typeof attrs.variations === 'string' ? JSON.parse(attrs.variations) : attrs.variations;
                
                // For variable products, show the base product without specific variation
                selectedVariation = null;
                
                if (selectedVariation) {
                  price = getPriceByUserType(selectedVariation, userType);
                  const variationName = selectedVariation.value || selectedVariation.attributeValue || Object.values(selectedVariation)[0];
                  productName = `${productName} - ${variationName}`;
                  if (selectedVariation.image) {
                    productImage = selectedVariation.image;
                  }
                } else {
                  // Show price range for variable products
                  const prices = variations.map(v => getPriceByUserType(v, userType));
                  if (prices.length > 0) {
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    price = minPrice;
                    priceRange = minPrice === maxPrice ? null : `${minPrice} - ${maxPrice}`;
                  }
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
              tamil: attrs.tamil,
              variation: selectedVariation
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