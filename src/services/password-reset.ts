import { getEcomUserByPhone, updateEcomUser } from './ecom-users';
import { sendOTPViaSMS } from './backend-sms';
import { generateOTP } from './sms';

export const sendPasswordResetOTP = async (phone: string): Promise<boolean> => {
  try {
    const userResponse = await getEcomUserByPhone(phone);
    if (userResponse.data && userResponse.data.length > 0) {
      const user = userResponse.data[0];
      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      
      await updateEcomUser(user.id, { otp, otpExpiresAt });
      await sendOTPViaSMS(phone, otp);
      return true;
    }
    return false;
  } catch (error) {
    
    return false;
  }
};

export const verifyPasswordResetOTP = async (phone: string, otp: string): Promise<boolean> => {
  try {
    const userResponse = await getEcomUserByPhone(phone);
    if (userResponse.data && userResponse.data.length > 0) {
      const user = userResponse.data[0];
      const isValid = user.attributes.otp === otp && 
                     new Date() <= new Date(user.attributes.otpExpiresAt || '');
      return isValid;
    }
    return false;
  } catch (error) {
    
    return false;
  }
};

export const resetPassword = async (phone: string, newPassword: string): Promise<boolean> => {
  try {
    const userResponse = await getEcomUserByPhone(phone);
    if (userResponse.data && userResponse.data.length > 0) {
      const user = userResponse.data[0];
      await updateEcomUser(user.id, { 
        password: newPassword,
        otp: null,
        otpExpiresAt: null
      });
      return true;
    }
    return false;
  } catch (error) {
    
    return false;
  }
};