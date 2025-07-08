export const saveWishlistToAPI = async (userId: number, wishlistItems: any[]): Promise<void> => {
  try {
    // Check if user wishlist exists
    const response = await fetch(`https://api.dharaniherbbals.com/api/user-wishlists?user=${userId}`);
    
    const wishlistData = {
      user: userId,
      items: JSON.stringify(wishlistItems),
      updatedAt: new Date().toISOString()
    };

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        // Update existing wishlist
        await fetch(`https://api.dharaniherbbals.com/api/user-wishlists/${data.data[0].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: wishlistData })
        });
      } else {
        // Create new wishlist
        await fetch('https://api.dharaniherbbals.com/api/user-wishlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: wishlistData })
        });
      }
    } else {
      // Create new wishlist if endpoint doesn't exist
      await fetch('https://api.dharaniherbbals.com/api/user-wishlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: wishlistData })
      });
    }
  } catch (error) {
    console.error('Failed to save wishlist:', error);
  }
};

export const loadWishlistFromAPI = async (userId: number): Promise<any[]> => {
  try {
    const response = await fetch(`https://api.dharaniherbbals.com/api/user-wishlists?user=${userId}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        const wishlistData = data.data[0].attributes;
        return JSON.parse(wishlistData.items || '[]');
      }
    }
    return [];
  } catch (error) {
    console.error('Failed to load wishlist:', error);
    return [];
  }
};