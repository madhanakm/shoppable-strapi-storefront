import { post } from './api';

export const sendOTPViaSMS = async (mobile: string, otp: string): Promise<boolean> => {
  try {
    console.log('Sending SMS to:', mobile, 'with OTP:', otp);
    const response = await post('/send-sms', {
      data: {
        mobile,
        otp
      }
    });
    console.log('SMS API Response:', response);
    return true;
  } catch (error) {
    console.error('SMS sending failed:', error);
    return false;
  }
};