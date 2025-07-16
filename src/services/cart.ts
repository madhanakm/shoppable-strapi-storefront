export const saveCartToAPI = async (userId: number, cartItems: any[]): Promise<boolean> => {
  try {
    
    
    // Also save to localStorage as backup
    localStorage.setItem('lastSavedCart', JSON.stringify(cartItems));
    localStorage.setItem('lastSavedCartUserId', userId.toString());
    const timestamp = new Date().getTime();
    const response = await fetch(`https://api.dharaniherbbals.com/api/user-carts?filters[user][id][$eq]=${userId}&timestamp=${timestamp}`);
    
    const cartData = {
      user: userId,
      items: JSON.stringify(cartItems),
      updatedAt: new Date().toISOString()
    };

    if (response.ok) {
      const data = await response.json();
      
      const userCart = data.data?.[0];
      if (userCart) {
        
        const updateResponse = await fetch(`https://api.dharaniherbbals.com/api/user-carts/${userCart.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: cartData })
        });
        
        if (!updateResponse.ok) {
          
        } else {
          
          return true;
        }
        return false;
      } else {
        
        const createResponse = await fetch('https://api.dharaniherbbals.com/api/user-carts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: cartData })
        });
        
        if (!createResponse.ok) {
          
          return false;
        } else {
          
          return true;
        }
      }
    } else {
      
      return false;
    }
  } catch (error) {
    
    return false;
  }
};

// Helper function to get backup cart from localStorage
const getBackupCart = (userId: number): any[] => {
  const lastSavedCartUserId = localStorage.getItem('lastSavedCartUserId');
  if (lastSavedCartUserId === userId.toString()) {
    const lastSavedCart = localStorage.getItem('lastSavedCart');
    if (lastSavedCart) {
      try {
        const backupCart = JSON.parse(lastSavedCart);
        
        return backupCart;
      } catch (e) {
        
      }
    }
  }
  return [];
};

export const loadCartFromAPI = async (userId: number): Promise<any[]> => {
  // Check for cart saved during page unload
  const cartUserIdBeforeUnload = localStorage.getItem('cartUserIdBeforeUnload');
  const cartBeforeUnload = localStorage.getItem('cartBeforeUnload');
  
  if (cartUserIdBeforeUnload === userId.toString() && cartBeforeUnload) {
    try {
      const unloadCart = JSON.parse(cartBeforeUnload);
      
      // Clear the unload cart after using it
      localStorage.removeItem('cartBeforeUnload');
      localStorage.removeItem('cartUserIdBeforeUnload');
      return unloadCart;
    } catch (e) {
      
    }
  }
  
  // First, fetch all available products to check against
  try {
    const timestamp = new Date().getTime();
    const productsResponse = await fetch(`https://api.dharaniherbbals.com/api/product-masters?pagination[limit]=-1&timestamp=${timestamp}`);
    const productsData = await productsResponse.json();
    const availableProducts = productsData.data || [];
    const availableProductIds = availableProducts.map(p => p.id.toString());
    
    
    // Now fetch the cart
    const cartResponse = await fetch(`https://api.dharaniherbbals.com/api/user-carts?filters[user][id][$eq]=${userId}&timestamp=${timestamp}`);
    if (!cartResponse.ok) {
      
      return [];
    }
    
    const cartData = await cartResponse.json();
    if (!cartData.data || cartData.data.length === 0) {
      
      return [];
    }
    
    const cartItems = JSON.parse(cartData.data[0].attributes.items || '[]');
    
    
    // Filter out products that don't exist in the API
    const filteredCart = cartItems.filter(item => {
      const exists = availableProductIds.includes(item.id);
      if (!exists) {
        
      }
      return exists;
    });
    
    
    
    // If items were filtered out, save the filtered cart back to API
    if (filteredCart.length !== cartItems.length) {
      
      await saveCartToAPI(userId, filteredCart);
    }
    
    return filteredCart;
  } catch (error) {
    
    return [];
  }
  // Add timestamp to prevent caching
  const timestamp = new Date().getTime();
  try {
    
    
    const response = await fetch(`https://api.dharaniherbbals.com/api/user-carts?filters[user][id][$eq]=${userId}&timestamp=${timestamp}`);
    
    if (response.ok) {
      const data = await response.json();
      
      
      if (data.data && data.data.length > 0) {
        const cartData = data.data[0];
        let items = [];
        try {
          items = JSON.parse(cartData.attributes.items || '[]');
        } catch (e) {
          
        }
        
        return items;
      }
    }
    
    
    return getBackupCart(userId);
  } catch (error) {
    
    return [];
  }
};