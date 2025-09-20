import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { saveWishlistToAPI, loadWishlistFromAPI } from '@/services/wishlist';

export const useWishlist = () => {
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    loadWishlist();
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      saveWishlistToAPI(user.id, wishlistProductIds);
    } else {
      localStorage.setItem('wishlist', JSON.stringify(wishlistProductIds));
    }
  }, [wishlistProductIds, isAuthenticated, user?.id]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      if (isAuthenticated && user?.id) {
        const apiWishlist = await loadWishlistFromAPI(user.id);
        setWishlistProductIds(apiWishlist);
      } else {
        // Clear wishlist when not authenticated
        setWishlistProductIds([]);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = (productId: string) => {
    setWishlistProductIds(prev => 
      prev.includes(productId) ? prev : [...prev, productId]
    );
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistProductIds(prev => prev.filter(id => id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlistProductIds.includes(productId);
  };

  const clearWishlist = () => {
    setWishlistProductIds([]);
  };

  return {
    wishlistProductIds,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount: wishlistProductIds.length,
    loading
  };
};