import { get, put, post } from './api';
import { getEcomUser, updateEcomUser } from './ecom-users';

export const updateProfile = async (userId: number, profileData: any): Promise<boolean> => {
  try {
    await updateEcomUser(userId, profileData);
    return true;
  } catch (error) {
    
    return false;
  }
};

export const changePassword = async (userId: number, currentPassword: string, newPassword: string): Promise<boolean> => {
  try {
    const userResponse = await getEcomUser(userId);
    const user = userResponse.data.attributes;
    
    if (user.password === currentPassword) {
      await updateEcomUser(userId, { password: newPassword });
      return true;
    }
    return false;
  } catch (error) {
    
    return false;
  }
};

export const addAddress = async (userId: number, addressData: any): Promise<boolean> => {
  try {
    
    
    
    // Try different endpoint variations
    const endpoints = [
      'https://api.dharaniherbbals.com/api/addresses',
      'https://api.dharaniherbbals.com/api/user-address',
      'https://api.dharaniherbbals.com/api/customer-addresses'
    ];
    
    const payload = {
      data: {
        ...addressData,
        user: userId,
        userId: userId
      }
    };
    
    
    
    for (const endpoint of endpoints) {
      try {
        
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
        
        
        
        if (response.ok) {
          const responseData = await response.json();
          
          
          return true;
        } else if (response.status !== 405) {
          // If it's not method not allowed, log the error
          const errorText = await response.text();
          
        }
      } catch (endpointError) {
        
      }
    }
    
    
    return false;
  } catch (error) {
    
    return false;
  }
};

export const getAddresses = async (userId: number): Promise<any[]> => {
  try {
    
    const response = await fetch(`https://api.dharaniherbbals.com/api/addresses?filters[user][id][$eq]=${userId}&populate=*`);
    
    if (response.ok) {
      const data = await response.json();
      
      const addresses = data.data || [];
      // Double-check filtering on client side
      const filteredAddresses = addresses.filter(addr => {
        const userAttr = addr.attributes?.user?.data?.id || addr.attributes?.user || addr.attributes?.userId;
        return userAttr == userId;
      });
      
      return filteredAddresses;
    }
    
    return [];
  } catch (error) {
    
    return [];
  }
};

export const updateAddress = async (addressId: number, addressData: any): Promise<boolean> => {
  try {
    const response = await fetch(`https://api.dharaniherbbals.com/api/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: addressData })
    });
    return response.ok;
  } catch (error) {
    
    return false;
  }
};

export const deleteAddress = async (addressId: number): Promise<boolean> => {
  try {
    const response = await fetch(`https://api.dharaniherbbals.com/api/addresses/${addressId}`, {
      method: 'DELETE'
    });
    return response.ok;
  } catch (error) {
    
    return false;
  }
};