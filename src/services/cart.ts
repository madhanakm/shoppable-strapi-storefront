import { get, post, put } from './api';

export const saveCartToAPI = async (userId: number, cartItems: any[]): Promise<void> => {
  try {
    // Check if user cart exists
    const existingCart = await get('/user-carts', {
      'filters[user][$eq]': userId.toString()
    });

    const cartData = {
      user: userId,
      items: JSON.stringify(cartItems),
      updatedAt: new Date().toISOString()
    };

    if (existingCart.data && existingCart.data.length > 0) {
      // Update existing cart
      await put(`/user-carts/${existingCart.data[0].id}`, { data: cartData });
    } else {
      // Create new cart
      await post('/user-carts', { data: cartData });
    }
  } catch (error) {
    console.error('Failed to save cart:', error);
  }
};

export const loadCartFromAPI = async (userId: number): Promise<any[]> => {
  try {
    const response = await get('/user-carts', {
      'filters[user][$eq]': userId.toString()
    });

    if (response.data && response.data.length > 0) {
      const cartData = response.data[0].attributes;
      return JSON.parse(cartData.items || '[]');
    }
    return [];
  } catch (error) {
    console.error('Failed to load cart:', error);
    return [];
  }
};