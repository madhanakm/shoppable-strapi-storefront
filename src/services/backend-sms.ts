import { post } from './api';

export const sendOTPViaSMS = async (mobile: string, otp: string, type: 'registration' | 'password-reset' | 'login' = 'registration'): Promise<boolean> => {
  try {
    const response = await post('/send-sms', {
      data: {
        mobile,
        otp,
        type // 'registration', 'password-reset', or 'login'
      }
    });
    
    return true;
  } catch (error) {
    console.error('SMS sending failed:', error);
    return false;
  }
};