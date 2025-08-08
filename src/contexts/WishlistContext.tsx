import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useWishlist } from '@/hooks/useWishlist';

interface WishlistContextType {
  wishlistSkuIds: string[];
  addToWishlist: (skuid: string) => void;
  removeFromWishlist: (skuid: string) => void;
  isInWishlist: (skuid: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlistContext = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlistContext must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const wishlistHook = useWishlist();

  return (
    <WishlistContext.Provider value={wishlistHook}>
      {children}
    </WishlistContext.Provider>
  );
};

