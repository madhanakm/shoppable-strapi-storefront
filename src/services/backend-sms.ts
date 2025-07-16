import { post } from './api';

export const sendOTPViaSMS = async (mobile: string, otp: string): Promise<boolean> => {
  try {
    
    const response = await post('/send-sms', {
      data: {
        mobile,
        otp
      }
    });
    
    return true;
  } catch (error) {
    
    return false;
  }
};