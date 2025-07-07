
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { saveWishlistToAPI, loadWishlistFromAPI } from '@/services/wishlist';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  wishlistCount: number;
  syncWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadUserWishlist();
    } else {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      saveWishlistToAPI(user.id, wishlistItems);
    } else {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isAuthenticated, user]);

  const loadUserWishlist = async () => {
    if (user?.id) {
      const userWishlist = await loadWishlistFromAPI(user.id);
      setWishlistItems(userWishlist);
    }
  };

  const syncWishlist = () => {
    if (isAuthenticated && user?.id) {
      loadUserWishlist();
    }
  };

  const addToWishlist = (item: WishlistItem) => {
    setWishlistItems(prev => {
      if (!prev.find(wishlistItem => wishlistItem.id === item.id)) {
        return [...prev, item];
      }
      return prev;
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  };

  const isInWishlist = (id: string) => {
    return wishlistItems.some(item => item.id === id);
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      wishlistCount,
      syncWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
