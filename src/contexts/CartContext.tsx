
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { saveCartToAPI, loadCartFromAPI } from '@/services/cart';
import { getPriceByUserType } from '@/lib/pricing';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  skuid?: string;
  tamil?: string;
  variation?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  syncCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  
  // Fetch user type
  useEffect(() => {
    const fetchUserType = async () => {
      if (user?.userType) {
        setUserType(user.userType);
        return;
      }
      
      try {
        // Get user from local storage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Fetch user type from API using user ID
          const response = await fetch(`https://api.dharaniherbbals.com/api/ecom-users/${userData.id}`, {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
            }
          });
          if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.attributes) {
              setUserType(result.data.attributes.userType || 'customer');
            }
          }
        } else {
          setUserType('customer'); // Default user type
        }
      } catch (error) {
        
        setUserType('customer'); // Default to customer on error
      }
    };
    
    fetchUserType();
  }, [user]);

  // Load cart when user logs in or user type changes
  useEffect(() => {
    // Store current cart items before loading new ones
    const previousCartItems = [...cartItems];
    
    const loadCart = async () => {
      if (isAuthenticated && user?.id) {
        setCurrentUserId(user.id);
        
        try {
          
          const userCart = await loadCartFromAPI(user.id);
          
          
          if (userCart && Array.isArray(userCart) && userCart.length > 0) {
            // Update prices based on current user type
            const updatedCart = await updateCartPrices(userCart);
            
            setCartItems(updatedCart);
          } else {
            // Don't clear cart on refresh if API returns empty
            
            
            // First check if we have previous cart items
            if (previousCartItems.length > 0) {
              
              setCartItems(previousCartItems);
              // Save to API immediately
              saveCartToAPI(user.id, previousCartItems);
            } else {
              // Then try localStorage
              const savedCart = localStorage.getItem('cart');
              if (savedCart) {
                try {
                  const parsedCart = JSON.parse(savedCart);
                  
                  if (parsedCart && parsedCart.length > 0) {
                    setCartItems(parsedCart);
                    // Save to API immediately
                    saveCartToAPI(user.id, parsedCart);
                  } else {
                    setCartItems([]);
                  }
                } catch (e) {
                  
                  setCartItems([]);
                }
              } else {
                // Finally try backup cart
                const backupCart = getBackupCart(user.id);
                if (backupCart.length > 0) {
                  
                  setCartItems(backupCart);
                  // Save to API immediately
                  saveCartToAPI(user.id, backupCart);
                } else {
                  setCartItems([]);
                }
              }
            }
          }
          setHasLoadedCart(true);
        } catch (error) {
          
          setCartItems([]);
          setHasLoadedCart(true);
        }
      } else if (!isAuthenticated) {
        setCurrentUserId(null);
        setCartItems([]);
        setHasLoadedCart(false);
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            
            setCartItems(parsedCart);
          } catch (e) {
            
          }
        }
      }
    };
    
    loadCart();
  }, [isAuthenticated, user?.id]);
  
  // Update cart prices when userType changes
  useEffect(() => {
    if (hasLoadedCart && cartItems.length > 0 && userType) {
      const updatePrices = async () => {
        const updatedCart = await updateCartPrices(cartItems);
        setCartItems(updatedCart);
      };
      updatePrices();
    }
  }, [userType]);

  // Save cart whenever it changes (but not during initial load)
  const [hasLoadedCart, setHasLoadedCart] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated && user?.id && hasLoadedCart) {
      // Always save cart state to API, including empty cart
      
      const saveCart = async () => {
        const success = await saveCartToAPI(user.id, cartItems);
        if (!success) {
          
          // Retry after 2 seconds
          setTimeout(async () => {
            
            await saveCartToAPI(user.id, cartItems);
          }, 2000);
        }
      };
      saveCart();
      
      // Save cart on page unload/refresh
      const handleBeforeUnload = () => {
        
        localStorage.setItem('cartBeforeUnload', JSON.stringify(cartItems));
        localStorage.setItem('cartUserIdBeforeUnload', user.id.toString());
        
        // Use synchronous fetch to ensure it completes before unload
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `https://api.dharaniherbbals.com/api/user-carts?filters[user][id][$eq]=${user.id}`, false); // false = synchronous
        xhr.send();
        
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          const userCart = data.data?.[0];
          
          if (userCart) {
            const updateXhr = new XMLHttpRequest();
            updateXhr.open('PUT', `https://api.dharaniherbbals.com/api/user-carts/${userCart.id}`, false);
            updateXhr.setRequestHeader('Content-Type', 'application/json');
            updateXhr.send(JSON.stringify({
              data: {
                user: user.id,
                items: JSON.stringify(cartItems),
                updatedAt: new Date().toISOString()
              }
            }));
          } else {
            const createXhr = new XMLHttpRequest();
            createXhr.open('POST', 'https://api.dharaniherbbals.com/api/user-carts', false);
            createXhr.setRequestHeader('Content-Type', 'application/json');
            createXhr.send(JSON.stringify({
              data: {
                user: user.id,
                items: JSON.stringify(cartItems),
                updatedAt: new Date().toISOString()
              }
            }));
          }
        }
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    } else if (!isAuthenticated) {
      
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated, user?.id, hasLoadedCart]);

  const loadUserCart = async () => {
    if (user?.id) {
      const userCart = await loadCartFromAPI(user.id);
      // Filter out deleted products
      const validCart = await filterValidProducts(userCart || []);
      
      // Update prices based on user type
      const updatedCart = await Promise.all(validCart.map(async (item) => {
        try {
          const response = await fetch(`https://api.dharaniherbbals.com/api/product-masters?filters[productId][$eq]=${item.id}`, {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
            }
          });
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            const productData = data.data[0].attributes;
            return {
              ...item,
              price: getPriceByUserType(productData, userType)
            };
          }
          return item;
        } catch (error) {
          
          return item;
        }
      }));
      
      setCartItems(updatedCart);
      setHasLoadedCart(true);
    }
  };
  
  const updateCartPrices = async (items: CartItem[]) => {
    try {
      if (!items || items.length === 0) {
        
        return items;
      }
      
      
      const timestamp = new Date().getTime();
      const response = await fetch(`https://api.dharaniherbbals.com/api/product-masters?pagination[limit]=-1&timestamp=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
        }
      });
      const data = await response.json();
      const products = data.data || [];
      
      // Filter out inactive products and update prices
      const updatedItems = items
        .filter(item => {
          const product = products.find(p => p.id.toString() === item.id);
          
          if (!product) {
            return false;
          }
          
          const status = product.attributes?.status;
          
          if (status === false || status === 'false' || status === 0 || status === '0') {
            return false;
          }
          return true;
        })
        .map(item => {
          const product = products.find(p => p.id.toString() === item.id);
          if (product) {
            const attrs = product.attributes;
            let newPrice = getPriceByUserType(attrs, userType || 'customer');
            
            if (attrs.isVariableProduct && attrs.variations && item.variation) {
              try {
                const variations = typeof attrs.variations === 'string' ? JSON.parse(attrs.variations) : attrs.variations;
                const selectedVariation = variations.find(v => v.attributeValue === item.variation);
                if (selectedVariation) {
                  newPrice = getPriceByUserType(selectedVariation, userType || 'customer');
                }
              } catch (e) {
                
              }
            }
            
            return { ...item, price: newPrice };
          }
          return item;
        });
      

      return updatedItems;
    } catch (error) {
      
      return items;
    }
  };

  const syncCart = () => {
    if (isAuthenticated && user?.id) {
      loadUserCart();
    }
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    // Fetch the latest price based on user type if available
    const fetchLatestPrice = async (productId: string) => {
      try {
        const response = await fetch(`https://api.dharaniherbbals.com/api/product-masters?filters[productId][$eq]=${productId}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
          }
        });
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const productData = data.data[0].attributes;
          return getPriceByUserType(productData, userType);
        }
        return item.price; // Fallback to provided price
      } catch (error) {
        
        return item.price; // Fallback to provided price
      }
    };
    
    // Update cart with latest price
    fetchLatestPrice(item.id).then(latestPrice => {
      setCartItems(prev => {
        const existingItem = prev.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
          return prev.map(cartItem =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1, price: latestPrice }
              : cartItem
          );
        }
        return [...prev, { ...item, price: latestPrice, quantity: 1 }];
      });
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
      syncCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
