
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { saveWishlistToAPI, loadWishlistFromAPI } from '@/services/wishlist';
import { getBackupCart } from '@/services/cart'; // Import helper function
import { getPriceByUserType } from '@/lib/pricing';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  tamil?: string;
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
    // Store current wishlist items before loading new ones
    const previousWishlistItems = [...wishlistItems];
    
    const loadWishlist = async () => {
      if (isAuthenticated && user?.id) {
        if (currentUserId !== null && user.id !== currentUserId) {
          
          setWishlistItems([]);
          setHasLoadedWishlist(false);
        }
        setCurrentUserId(user.id);
        
        try {
          const userWishlist = await loadWishlistFromAPI(user.id);
          
          
          if (userWishlist && Array.isArray(userWishlist) && userWishlist.length > 0) {
            // Update prices based on current user type
            const updatedWishlist = await updateWishlistPrices(userWishlist);
            setWishlistItems(updatedWishlist);
          } else {
            
            
            // First check if we have previous wishlist items
            if (previousWishlistItems.length > 0) {
              
              setWishlistItems(previousWishlistItems);
              // Save to API immediately
              saveWishlistToAPI(user.id, previousWishlistItems);
            } else {
              // Then try localStorage
              const savedWishlist = localStorage.getItem('wishlist');
              if (savedWishlist) {
                try {
                  const parsedWishlist = JSON.parse(savedWishlist);
                  
                  if (parsedWishlist && parsedWishlist.length > 0) {
                    setWishlistItems(parsedWishlist);
                    // Save to API immediately
                    saveWishlistToAPI(user.id, parsedWishlist);
                  } else {
                    setWishlistItems([]);
                  }
                } catch (e) {
                  
                  setWishlistItems([]);
                }
              } else {
                setWishlistItems([]);
              }
            }
          }
          setHasLoadedWishlist(true);
        } catch (error) {
          
          setWishlistItems([]);
          setHasLoadedWishlist(true);
        }
      } else if (!isAuthenticated) {
        
        setCurrentUserId(null);
        setWishlistItems([]);
        setHasLoadedWishlist(false);
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          setWishlistItems(JSON.parse(savedWishlist));
        }
      }
    };
    
    loadWishlist();
  }, [isAuthenticated, user?.id]);
  
  // Update wishlist prices when userType changes
  useEffect(() => {
    if (hasLoadedWishlist && wishlistItems.length > 0) {
      const updatePrices = async () => {
        // Fetch latest user type from API
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            const timestamp = new Date().getTime();
            const response = await fetch(`https://api.dharaniherbbals.com/api/ecom-users/${userData.id}?timestamp=${timestamp}`);
            if (response.ok) {
              const result = await response.json();
              if (result.data && result.data.attributes) {
                
              }
            }
          }
        } catch (error) {
          
        }
        
        const updatedWishlist = await updateWishlistPrices(wishlistItems);
        setWishlistItems(updatedWishlist);
      };
      updatePrices();
    }
  }, [user?.userType]);

  const [hasLoadedWishlist, setHasLoadedWishlist] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated && user?.id && hasLoadedWishlist) {
      // Always save wishlist state to API, including empty wishlist
      saveWishlistToAPI(user.id, wishlistItems);
    } else if (!isAuthenticated) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isAuthenticated, user?.id, hasLoadedWishlist]);

  const loadUserWishlist = async () => {
    if (user?.id) {
      
      const userWishlist = await loadWishlistFromAPI(user.id);
      
      // Filter out deleted products and update prices
      const validWishlist = await filterValidProducts(userWishlist || []);
      const updatedWishlist = await updateWishlistPrices(validWishlist);
      setWishlistItems(updatedWishlist);
      setHasLoadedWishlist(true);
    }
  };
  
  const updateWishlistPrices = async (items: WishlistItem[]) => {
    try {
      // First, get the latest user type from API
      let latestUserType = 'customer';
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const userTimestamp = new Date().getTime();
          const userResponse = await fetch(`https://api.dharaniherbbals.com/api/ecom-users/${userData.id}?timestamp=${userTimestamp}`);
          if (userResponse.ok) {
            const userResult = await userResponse.json();
            if (userResult.data && userResult.data.attributes) {
              latestUserType = userResult.data.attributes.userType || 'customer';
              
            }
          }
        }
      } catch (e) {
        
      }
      
      // Now get products with latest prices
      const timestamp = new Date().getTime();
      const response = await fetch(`https://api.dharaniherbbals.com/api/product-masters?pagination[limit]=-1&timestamp=${timestamp}`);
      const data = await response.json();
      const products = data.data || [];
      
      // Filter out inactive products and update prices
      
      
      
      return items.filter(item => {
        
        const product = products.find(p => p.id.toString() === item.id);
        
        
        if (!product) {
          
          return false;
        }
        
        const status = product.attributes?.status;
        
        
        if (status === false || status === 'false' || status === 0 || status === '0') {
          
          return false;
        }
        return true;
      }).map(item => {
        const product = products.find(p => p.id.toString() === item.id);
        if (product) {
          const attrs = product.attributes;
          
          const newPrice = getPriceByUserType(attrs, latestUserType);
          
          return { ...item, price: newPrice };
        }
        return item;
      });
    } catch (error) {
      
      return items;
    }
  };
  
  const filterValidProducts = async (items: WishlistItem[]) => {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`https://api.dharaniherbbals.com/api/product-masters?pagination[limit]=-1&timestamp=${timestamp}`);
      const data = await response.json();
      const products = data.data || [];
      
      return items.filter(item => {
        const product = products.find(p => p.id.toString() === item.id);
        if (!product) {
          
          return false;
        }
        
        const status = product.attributes?.status;
        if (status === false || status === 'false' || status === 0 || status === '0') {
          
          return false;
        }
        return true;
      });
    } catch (error) {
      
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
