import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { saveWishlistToAPI, loadWishlistFromAPI } from '@/services/wishlist';
import { toast } from '@/hooks/use-toast';

export const useWishlist = () => {
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) loadWishlist();
  }, [isAuthenticated, user?.id, authLoading]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user?.id || !loaded) return;
    saveWishlistToAPI(user.id, wishlistProductIds);
  }, [wishlistProductIds, isAuthenticated, user?.id, authLoading, loaded]);

  const loadWishlist = async () => {
    if (authLoading) return;
    if (!isAuthenticated || !user?.id) return;
    setLoading(true);
    try {
      const apiWishlist = await loadWishlistFromAPI(user.id);
      setWishlistProductIds(apiWishlist);
      setLoaded(true);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = (productId: string) => {
    setWishlistProductIds(prev => {
      if (prev.includes(productId)) {
        return prev;
      }
      toast({
        title: "Added to Wishlist",
        description: "Product added to wishlist successfully",
      });
      return [...prev, productId];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistProductIds(prev => prev.filter(id => id !== productId));
    toast({
      title: "Removed from Wishlist",
      description: "Product removed from wishlist",
    });
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