import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPriceByUserType } from '@/lib/pricing';

interface CartItem {
  productId: string;
  quantity: number;
  id: string;
}

export const useCartProducts = (cartItems: CartItem[]) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cartKey, setCartKey] = useState('');

  useEffect(() => {
    const newKey = JSON.stringify(cartItems.map(item => `${item.productId}-${item.quantity}`));
    if (newKey !== cartKey) {
      setCartKey(newKey);
    }
  }, [cartItems]);

  useEffect(() => {
    if (cartItems.length > 0) {
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [cartKey, user?.userType]);

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
          let product = null;
          let selectedVariation = null;
          
          // Try to find by base product ID (cartItem.id)
          let response = await fetch(`https://api.dharaniherbbals.com/api/product-masters/${cartItem.id}`, {
            headers: { 'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            product = data.data || data;
            
            // If product is variable and has skuid, find the specific variation
            if (product && product.attributes?.isVariableProduct && product.attributes?.variations && cartItem.productId !== cartItem.id) {
              try {
                const variations = typeof product.attributes.variations === 'string' ? JSON.parse(product.attributes.variations) : product.attributes.variations;
                selectedVariation = variations.find(v => v.skuid && v.skuid.toString() === cartItem.productId);
              } catch (e) {}
            }
          }
          
          if (product) {
            const attrs = product.attributes;
            
            if (attrs.status === false) return null;
            
            let price = getPriceByUserType(attrs, userType);
            let productName = attrs.Name || attrs.name;
            let productImage = attrs.photo || attrs.image;
            
            // Handle variable products
            if (attrs.isVariableProduct && attrs.variations && !selectedVariation) {
              try {
                const variations = typeof attrs.variations === 'string' ? JSON.parse(attrs.variations) : attrs.variations;
                
                // Find the specific variation by SKU
                selectedVariation = variations.find(v => v.skuid && v.skuid.toString() === cartItem.productId);
                
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
            } else if (selectedVariation) {
              // Use the already found variation
              price = getPriceByUserType(selectedVariation, userType);
              const variationName = selectedVariation.value || selectedVariation.attributeValue || Object.values(selectedVariation)[0];
              productName = `${productName} - ${variationName}`;
              if (selectedVariation.image) {
                productImage = selectedVariation.image;
              }
            }
            
            return {
              id: product.id,
              skuid: cartItem.productId, // This is the actual SKUID (for variations) or product ID (for simple products)
              originalProductId: product.id, // Always use base product ID
              cartProductId: cartItem.productId, // Store original cart productId (SKUID for variations)
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
      const validProducts = results.filter(Boolean);
      
      // Remove inactive products from cart - match by productId directly
      const validProductIds = validProducts.map(p => {
        // For variations, use the original cart productId that was used to find this product
        const matchingCartItem = cartItems.find(ci => ci.id === p.id.toString());
        return matchingCartItem ? matchingCartItem.productId : p.id.toString();
      });
      const invalidProductIds = cartItems.filter(item => !validProductIds.includes(item.productId)).map(item => item.productId);
      
      if (invalidProductIds.length > 0) {
        // Auto-remove inactive products from cart - skip for now to avoid require error
      }
      
      setProducts(validProducts);
    } catch (error) {
      console.error('Error fetching cart products:', error);
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = products.reduce((total, item) => total + (item.price * item.quantity), 0);

  return { products, loading, cartTotal };
};