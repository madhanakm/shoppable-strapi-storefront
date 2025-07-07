const SMS_CONFIG = {
  username: 'sundarppy@gmail.com',
  password: 'Dharani123',
  sender_id: 'DHHERB',
  route: 'T',
  base_url: 'http://smsc.biz/httpapi/send'
};

export const sendOTP = async (phoneNumber: string, otp: string): Promise<boolean> => {
  try {
    const message = `OTP for Login/Transaction on Dharani Herbbals is ${otp} and valid for 30 minutes. Do not share this OTP with anyone for security reasons.`;
    
    const params = new URLSearchParams({
      username: SMS_CONFIG.username,
      password: SMS_CONFIG.password,
      sender_id: SMS_CONFIG.sender_id,
      route: SMS_CONFIG.route,
      phonenumber: phoneNumber,
      message: message
    });

    console.log('Sending SMS to:', phoneNumber, 'with OTP:', otp);
    const response = await fetch(`${SMS_CONFIG.base_url}?${params.toString()}`);
    const result = await response.text();
    console.log('SMS API response:', result);
    return response.ok;
  } catch (error) {
    console.error('SMS sending failed:', error);
    return false;
  }
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};