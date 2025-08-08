import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPriceByUserType } from '@/lib/pricing';

interface CartItem {
  skuid: string;
  quantity: number;
  id: string;
}

export const useCartProducts = (cartItems: CartItem[]) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cartItems.length > 0) {
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [cartItems, user?.userType]);

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

      const productPromises = cartItems.map(async (cartItem) => {
        try {
          // First try to find by exact SKU match
          let response = await fetch(`https://api.dharaniherbbals.com/api/product-masters?filters[skuid][$eq]=${cartItem.skuid}`, {
            headers: { 'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}` }
          });
          
          let product = null;
          let selectedVariation = null;
          
          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
              product = data.data[0];
            }
          }
          
          // If not found by SKU, try to find by product ID
          if (!product && cartItem.id) {
            response = await fetch(`https://api.dharaniherbbals.com/api/product-masters/${cartItem.id}`, {
              headers: { 'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}` }
            });
            
            if (response.ok) {
              const data = await response.json();
              product = data.data || data;
            }
          }
          
          if (product) {
            const attrs = product.attributes;
            
            if (attrs.status === false) return null;
            
            let price = getPriceByUserType(attrs, userType);
            let productName = attrs.Name || attrs.name;
            let productImage = attrs.photo || attrs.image;
            
            // Handle variable products
            if (attrs.isVariableProduct && attrs.variations) {
              try {
                const variations = typeof attrs.variations === 'string' ? JSON.parse(attrs.variations) : attrs.variations;
                
                // Find the specific variation by SKU
                selectedVariation = variations.find(v => v.skuid === cartItem.skuid);
                
                if (selectedVariation) {
                  price = getPriceByUserType(selectedVariation, userType);
                  const variationName = selectedVariation.value || selectedVariation.attributeValue || Object.values(selectedVariation)[0];
                  productName = `${productName} - ${variationName}`;
                  if (selectedVariation.image) {
                    productImage = selectedVariation.image;
                  }
                } else {
                  // Fallback to first variation if specific one not found
                  const firstVariation = variations[0];
                  if (firstVariation) {
                    price = getPriceByUserType(firstVariation, userType);
                  }
                }
              } catch (e) {
                console.error('Error parsing variations:', e);
              }
            }
            
            return {
              id: product.id,
              skuid: attrs.skuid || product.id,
              originalSkuid: cartItem.skuid,
              name: productName,
              price,
              image: productImage,
              category: attrs.category,
              tamil: attrs.tamil,
              quantity: cartItem.quantity,
              variation: selectedVariation
            };
          }
        } catch (e) {
          console.error('Error fetching product:', e);
        }
        return null;
      });

      const results = await Promise.all(productPromises);
      setProducts(results.filter(Boolean));
    } catch (error) {
      console.error('Error fetching cart products:', error);
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = products.reduce((total, item) => total + (item.price * item.quantity), 0);

  return { products, loading, cartTotal };
};