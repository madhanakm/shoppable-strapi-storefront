import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserType } from '@/hooks/useUserTypeQuery';
import { getPriceByUserType } from '@/lib/pricing';

const API_URL = 'https://api.dharaniherbbals.com/api';
const TOKEN = import.meta.env.VITE_STRAPI_API_TOKEN;
const FIELDS = 'fields[0]=Name&fields[1]=skuid&fields[2]=customerprice&fields[3]=resellerprice&fields[4]=retailprice&fields[5]=sarvoprice&fields[6]=distributorprice&fields[7]=price&fields[8]=status&fields[9]=isVariableProduct&fields[10]=variations&fields[11]=category&fields[12]=tamil';

interface CartItem {
  productId: string;
  quantity: number;
  id: string;
}

export const useCartProducts = (cartItems: CartItem[]) => {
  const { user } = useAuth();
  const { data: userType = 'customer' } = useUserType();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cartKey, setCartKey] = useState('');

  useEffect(() => {
    const newKey = JSON.stringify(cartItems.map(item => `${item.productId}-${item.quantity}`));
    if (newKey !== cartKey) setCartKey(newKey);
  }, [cartItems]);

  useEffect(() => {
    if (cartItems.length > 0) {
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [cartKey, userType]);

  const fetchProducts = async () => {
    // Only show loading on first fetch, not on refetch
    if (products.length === 0) setLoading(true);
    try {
      const productPromises = cartItems.map(async (cartItem) => {
        try {
          const response = await fetch(`${API_URL}/product-masters/${cartItem.id}?${FIELDS}`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
          });

          if (!response.ok) return null;
          const data = await response.json();
          const product = data.data || data;
          const attrs = product.attributes;

          if (!attrs || attrs.status === false) return null;

          let price = getPriceByUserType(attrs, userType);
          let productName = attrs.Name || attrs.name;
          let productImage = 'https://via.placeholder.com/150x150?text=Product';
          let selectedVariation = null;

          if (attrs.isVariableProduct && attrs.variations) {
            try {
              const variations = typeof attrs.variations === 'string' ? JSON.parse(attrs.variations) : attrs.variations;
              selectedVariation = variations.find((v: any) => v.skuid && v.skuid.toString() === cartItem.productId);

              if (selectedVariation) {
                price = getPriceByUserType(selectedVariation, userType);
                const variationName = selectedVariation.value || selectedVariation.attributeValue || Object.values(selectedVariation)[0];
                productName = `${productName} - ${variationName}`;
                if (selectedVariation.image) productImage = selectedVariation.image;
              } else {
                const firstVariation = variations[0];
                if (firstVariation) price = getPriceByUserType(firstVariation, userType);
              }
            } catch (e) {}
          }

          return {
            id: product.id,
            skuid: cartItem.productId,
            originalProductId: product.id,
            cartProductId: cartItem.productId,
            name: productName,
            price,
            image: productImage,
            category: attrs.category,
            tamil: attrs.tamil,
            quantity: cartItem.quantity,
            variation: selectedVariation
          };
        } catch (e) {
          return null;
        }
      });

      const results = await Promise.all(productPromises);
      const validProducts = results.filter(Boolean);
      setProducts(validProducts);

      // Lazy load photos
      validProducts.forEach(async (product: any) => {
        try {
          const r = await fetch(`${API_URL}/product-masters/${product.id}?fields[0]=photo`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
          });
          if (!r.ok) return;
          const d = await r.json();
          const photo = d.data?.attributes?.photo;
          if (photo) {
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, image: photo } : p));
          }
        } catch {}
      });

    } catch (error) {
      console.error('Error fetching cart products:', error);
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = products.reduce((total, item) => total + (item.price * item.quantity), 0);

  return { products, loading, cartTotal };
};
