export const saveCartToAPI = async (userId: number, cartItems: any[]): Promise<void> => {
  try {
    const response = await fetch(`https://api.dharaniherbbals.com/api/user-carts?filters[user][id][$eq]=${userId}`);
    
    const cartData = {
      user: userId,
      items: JSON.stringify(cartItems),
      updatedAt: new Date().toISOString()
    };

    if (response.ok) {
      const data = await response.json();
      const userCart = data.data?.[0];
      if (userCart) {

        await fetch(`https://api.dharaniherbbals.com/api/user-carts/${userCart.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: cartData })
        });
      } else {

        await fetch('https://api.dharaniherbbals.com/api/user-carts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: cartData })
        });
      }
    }
  } catch (error) {
    console.error('Failed to save cart:', error);
  }
};

export const loadCartFromAPI = async (userId: number): Promise<any[]> => {
  try {

    
    // Try different query formats
    const queries = [
      `https://api.dharaniherbbals.com/api/user-carts?filters[user][$eq]=${userId}`,
      `https://api.dharaniherbbals.com/api/user-carts?user=${userId}`,
      `https://api.dharaniherbbals.com/api/user-carts?filters[user][id][$eq]=${userId}`,
      `https://api.dharaniherbbals.com/api/user-carts`
    ];
    
    for (const query of queries) {

      const response = await fetch(query);
      
      if (response.ok) {
        const data = await response.json();

        
        if (data.data && data.data.length > 0) {
          if (query.includes('filters[user][id][$eq]') && data.data.length > 0) {
            const items = JSON.parse(data.data[0].attributes.items || '[]');
            return items;
          }
        }
      }
    }
    

    return [];
  } catch (error) {
    console.error('Failed to load cart:', error);
    return [];
  }
};