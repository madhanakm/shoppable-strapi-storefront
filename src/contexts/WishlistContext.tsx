
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
  clearWishlist: () => void;
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
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      if (currentUserId !== null && user.id !== currentUserId) {
        console.log('Different user logged in, clearing wishlist data');
        setWishlistItems([]);
        setHasLoadedWishlist(false);
      }
      setCurrentUserId(user.id);
      loadUserWishlist();
    } else if (!isAuthenticated) {
      console.log('User logged out, clearing wishlist');
      setCurrentUserId(null);
      setWishlistItems([]);
      setHasLoadedWishlist(false);
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }
    }
  }, [isAuthenticated, user?.id]);

  const [hasLoadedWishlist, setHasLoadedWishlist] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated && user?.id && hasLoadedWishlist) {
      saveWishlistToAPI(user.id, wishlistItems);
    } else if (!isAuthenticated) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isAuthenticated, user?.id, hasLoadedWishlist]);

  const loadUserWishlist = async () => {
    if (user?.id) {
      console.log('Loading wishlist for user:', user.id);
      const userWishlist = await loadWishlistFromAPI(user.id);
      console.log('Received wishlist data:', userWishlist);
      // Filter out deleted products
      const validWishlist = await filterValidProducts(userWishlist || []);
      setWishlistItems(validWishlist);
      setHasLoadedWishlist(true);
    }
  };
  
  const filterValidProducts = async (items: WishlistItem[]) => {
    try {
      const response = await fetch('https://api.dharaniherbbals.com/api/product-masters?pagination[limit]=-1');
      const data = await response.json();
      const activeProducts = data.data || [];
      const activeProductIds = activeProducts
        .filter(p => p.attributes?.status === true)
        .map(p => p.id.toString());
      
      return items.filter(item => activeProductIds.includes(item.id));
    } catch (error) {
      console.error('Error filtering wishlist products:', error);
      return items;
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

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      wishlistCount,
      syncWishlist,
      clearWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
