export const saveWishlistToAPI = async (userId: number, productIds: string[]): Promise<void> => {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`https://api.dharaniherbbals.com/api/user-wishlists?filters[user][id][$eq]=${userId}&timestamp=${timestamp}`);
    
    const wishlistData = {
      user: userId,
      items: JSON.stringify(productIds)
    };

    if (response.ok) {
      const data = await response.json();
      const userWishlist = data.data?.[0];
      if (userWishlist) {
        await fetch(`https://api.dharaniherbbals.com/api/user-wishlists/${userWishlist.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
          },
          body: JSON.stringify({ data: wishlistData })
        });
      } else {
        await fetch('https://api.dharaniherbbals.com/api/user-wishlists', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
          },
          body: JSON.stringify({ data: wishlistData })
        });
      }
    }
  } catch (error) {
    console.error('Wishlist save error:', error);
  }
};

export const loadWishlistFromAPI = async (userId: number): Promise<string[]> => {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`https://api.dharaniherbbals.com/api/user-wishlists?filters[user][id][$eq]=${userId}&timestamp=${timestamp}`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_STRAPI_API_TOKEN}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        const wishlistData = data.data[0];
        const items = JSON.parse(wishlistData.attributes.items || '[]');
        return items;
      }
    }
    return [];
  } catch (error) {
    console.error('Wishlist load error:', error);
    return [];
  }
};