export const saveCartToAPI = async (userId: number, cartItems: any[]): Promise<boolean> => {
  try {
    localStorage.setItem('lastSavedCart', JSON.stringify(cartItems));
    localStorage.setItem('lastSavedCartUserId', userId.toString());
    
    const timestamp = new Date().getTime();
    const response = await fetch(`https://api.dharaniherbbals.com/api/user-carts?filters[user][id][$eq]=${userId}&timestamp=${timestamp}`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
      }
    });
    
    const cartData = {
      user: userId,
      items: JSON.stringify(cartItems)
    };

    if (response.ok) {
      const data = await response.json();
      const userCart = data.data?.[0];
      
      if (userCart) {
        const updateResponse = await fetch(`https://api.dharaniherbbals.com/api/user-carts/${userCart.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
          },
          body: JSON.stringify({ data: cartData })
        });
        return updateResponse.ok;
      } else {
        const createResponse = await fetch('https://api.dharaniherbbals.com/api/user-carts', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
          },
          body: JSON.stringify({ data: cartData })
        });
        return createResponse.ok;
      }
    }
    return false;
  } catch (error) {
    console.error('Cart save error:', error);
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
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`https://api.dharaniherbbals.com/api/user-carts?filters[user][id][$eq]=${userId}&timestamp=${timestamp}`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        const cartData = data.data[0];
        const items = JSON.parse(cartData.attributes.items || '[]');
        return items;
      }
    }
    return getBackupCart(userId);
  } catch (error) {
    console.error('Cart load error:', error);
    return getBackupCart(userId);
  }
};