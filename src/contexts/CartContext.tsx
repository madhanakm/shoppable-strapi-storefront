import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { saveCartToAPI, loadCartFromAPI } from '@/services/cart';

interface CartItem {
  skuid: string;
  quantity: number;
  id: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (skuid: string, id: string, quantity?: number) => void;
  removeFromCart: (skuid: string) => void;
  updateQuantity: (skuid: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  syncCart: () => void;
  loading: boolean;
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
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    loadCart();
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (cartItems.length > 0 || cartItems.length === 0) {
      if (isAuthenticated && user?.id) {
        saveCartToAPI(user.id, cartItems);
      } else {
        localStorage.setItem('cart', JSON.stringify(cartItems));
      }
    }
  }, [cartItems, isAuthenticated, user?.id]);

  const loadCart = async () => {
    setLoading(true);
    try {
      if (isAuthenticated && user?.id) {
        const apiCart = await loadCartFromAPI(user.id);
        const localCart = getLocalCart();
        
        if (localCart.length > 0 && apiCart.length === 0) {
          setCartItems(localCart);
          await saveCartToAPI(user.id, localCart);
        } else {
          setCartItems(apiCart);
        }
      } else {
        const localCart = getLocalCart();
        setCartItems(localCart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      const localCart = getLocalCart();
      setCartItems(localCart);
    } finally {
      setLoading(false);
    }
  };

  const getLocalCart = (): CartItem[] => {
    try {
      const localCart = localStorage.getItem('cart');
      return localCart ? JSON.parse(localCart) : [];
    } catch {
      return [];
    }
  };

  const addToCart = (skuid: string, id: string, quantity: number = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.skuid === skuid);
      if (existingItem) {
        return prev.map(item =>
          item.skuid === skuid
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { skuid, id, quantity }];
    });
  };

  const removeFromCart = (skuid: string) => {
    setCartItems(prev => prev.filter(item => item.skuid !== skuid));
  };

  const updateQuantity = (skuid: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(skuid);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.skuid === skuid ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const syncCart = async () => {
    await loadCart();
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      syncCart,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
};