
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { saveCartToAPI, loadCartFromAPI } from '@/services/cart';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  skuid?: string;
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
  const { user, isAuthenticated } = useAuth();

  // Load cart when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      if (currentUserId !== null && user.id !== currentUserId) {
        setCartItems([]);
        setHasLoadedCart(false);
      }
      setCurrentUserId(user.id);
      loadUserCart();
    } else if (!isAuthenticated) {
      setCurrentUserId(null);
      setCartItems([]);
      setHasLoadedCart(false);
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  }, [isAuthenticated, user?.id]);

  // Save cart whenever it changes (but not during initial load)
  const [hasLoadedCart, setHasLoadedCart] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated && user?.id && hasLoadedCart) {
      // Only save if there are items or if we need to clear the cart
      saveCartToAPI(user.id, cartItems);
    } else if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated, user?.id, hasLoadedCart]);

  const loadUserCart = async () => {
    if (user?.id) {
      const userCart = await loadCartFromAPI(user.id);
      // Filter out deleted products
      const validCart = await filterValidProducts(userCart || []);
      setCartItems(validCart);
      setHasLoadedCart(true);
    }
  };
  
  const filterValidProducts = async (items: CartItem[]) => {
    try {
      const response = await fetch('https://api.dharaniherbbals.com/api/product-masters?pagination[limit]=-1');
      const data = await response.json();
      const activeProducts = data.data || [];
      const activeProductIds = activeProducts
        .filter(p => p.attributes?.status === true)
        .map(p => p.id.toString());
      
      return items.filter(item => activeProductIds.includes(item.id));
    } catch (error) {
      console.error('Error filtering cart products:', error);
      return items;
    }
  };

  const syncCart = () => {
    if (isAuthenticated && user?.id) {
      loadUserCart();
    }
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
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
