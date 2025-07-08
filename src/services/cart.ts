export const saveCartToAPI = async (userId: number, cartItems: any[]): Promise<void> => {
  try {
    // Check if user cart exists
    const response = await fetch(`https://api.dharaniherbbals.com/api/user-carts?user=${userId}`);
    
    const cartData = {
      user: userId,
      items: JSON.stringify(cartItems),
      updatedAt: new Date().toISOString()
    };

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        // Update existing cart
        await fetch(`https://api.dharaniherbbals.com/api/user-carts/${data.data[0].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: cartData })
        });
      } else {
        // Create new cart
        await fetch('https://api.dharaniherbbals.com/api/user-carts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: cartData })
        });
      }
    } else {
      // Create new cart if endpoint doesn't exist
      await fetch('https://api.dharaniherbbals.com/api/user-carts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: cartData })
      });
    }
  } catch (error) {
    console.error('Failed to save cart:', error);
  }
};

export const loadCartFromAPI = async (userId: number): Promise<any[]> => {
  try {
    const response = await fetch(`https://api.dharaniherbbals.com/api/user-carts?user=${userId}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        const cartData = data.data[0].attributes;
        return JSON.parse(cartData.items || '[]');
      }
    }
    return [];
  } catch (error) {
    console.error('Failed to load cart:', error);
    return [];
  }
};