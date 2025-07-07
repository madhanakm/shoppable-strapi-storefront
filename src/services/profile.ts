import { get, put, post } from './api';
import { getEcomUser, updateEcomUser } from './ecom-users';

export const updateProfile = async (userId: number, profileData: any): Promise<boolean> => {
  try {
    await updateEcomUser(userId, profileData);
    return true;
  } catch (error) {
    console.error('Profile update failed:', error);
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
    console.error('Password change failed:', error);
    return false;
  }
};

export const addAddress = async (userId: number, addressData: any): Promise<boolean> => {
  try {
    await post('/addresses', {
      data: {
        ...addressData,
        user: userId
      }
    });
    return true;
  } catch (error) {
    console.error('Address addition failed:', error);
    return false;
  }
};

export const getAddresses = async (userId: number): Promise<any[]> => {
  try {
    const response = await get('/addresses', {
      'filters[user][$eq]': userId.toString()
    });
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch addresses:', error);
    return [];
  }
};