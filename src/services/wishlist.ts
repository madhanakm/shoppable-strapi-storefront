export const saveWishlistToAPI = async (userId: number, wishlistItems: any[]): Promise<void> => {
  try {
    // Check if user wishlist exists
    const response = await fetch(`https://api.dharaniherbbals.com/api/user-wishlists?filters[user][id][$eq]=${userId}`);
    
    const wishlistData = {
      user: userId,
      items: JSON.stringify(wishlistItems),
      updatedAt: new Date().toISOString()
    };

    if (response.ok) {
      const data = await response.json();
      const userWishlist = data.data?.[0];
      if (userWishlist) {

        await fetch(`https://api.dharaniherbbals.com/api/user-wishlists/${userWishlist.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: wishlistData })
        });
      } else {

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

    
    // Try different query formats
    const queries = [
      `https://api.dharaniherbbals.com/api/user-wishlists?filters[user][$eq]=${userId}`,
      `https://api.dharaniherbbals.com/api/user-wishlists?user=${userId}`,
      `https://api.dharaniherbbals.com/api/user-wishlists?filters[user][id][$eq]=${userId}`,
      `https://api.dharaniherbbals.com/api/user-wishlists`
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
    console.error('Failed to load wishlist:', error);
    return [];
  }
};