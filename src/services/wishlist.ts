import { get, post, put } from './api';

export const saveWishlistToAPI = async (userId: number, wishlistItems: any[]): Promise<void> => {
  try {
    const existingWishlist = await get('/user-wishlists', {
      'filters[user][$eq]': userId.toString()
    });

    const wishlistData = {
      user: userId,
      items: JSON.stringify(wishlistItems),
      updatedAt: new Date().toISOString()
    };

    if (existingWishlist.data && existingWishlist.data.length > 0) {
      await put(`/user-wishlists/${existingWishlist.data[0].id}`, { data: wishlistData });
    } else {
      await post('/user-wishlists', { data: wishlistData });
    }
  } catch (error) {
    console.error('Failed to save wishlist:', error);
  }
};

export const loadWishlistFromAPI = async (userId: number): Promise<any[]> => {
  try {
    const response = await get('/user-wishlists', {
      'filters[user][$eq]': userId.toString()
    });

    if (response.data && response.data.length > 0) {
      const wishlistData = response.data[0].attributes;
      return JSON.parse(wishlistData.items || '[]');
    }
    return [];
  } catch (error) {
    console.error('Failed to load wishlist:', error);
    return [];
  }
};