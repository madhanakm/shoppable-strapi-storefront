import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { saveWishlistToAPI, loadWishlistFromAPI } from '@/services/wishlist';

export const useWishlist = () => {
  const [wishlistSkuIds, setWishlistSkuIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    loadWishlist();
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      saveWishlistToAPI(user.id, wishlistSkuIds);
    } else {
      localStorage.setItem('wishlist', JSON.stringify(wishlistSkuIds));
    }
  }, [wishlistSkuIds, isAuthenticated, user?.id]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      if (isAuthenticated && user?.id) {
        const apiWishlist = await loadWishlistFromAPI(user.id);
        setWishlistSkuIds(apiWishlist);
      } else {
        // Clear wishlist when not authenticated
        setWishlistSkuIds([]);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = (skuid: string) => {
    setWishlistSkuIds(prev => 
      prev.includes(skuid) ? prev : [...prev, skuid]
    );
  };

  const removeFromWishlist = (skuid: string) => {
    setWishlistSkuIds(prev => prev.filter(id => id !== skuid));
  };

  const isInWishlist = (skuid: string) => {
    return wishlistSkuIds.includes(skuid);
  };

  const clearWishlist = () => {
    setWishlistSkuIds([]);
  };

  return {
    wishlistSkuIds,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount: wishlistSkuIds.length,
    loading
  };
};