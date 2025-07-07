import { post, get } from './api';

export interface OTPData {
  mobile: string;
  otp: string;
  expiresAt?: string;
}

export interface OTPResponse {
  data: {
    id: number;
    attributes: OTPData & {
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
    };
  };
}

export const createOTP = async (mobile: string, otp: string): Promise<OTPResponse> => {
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
  return post<OTPResponse>('/ecom-users/otp', { 
    mobile, 
    otp, 
    expiresAt 
  });
};

export const verifyOTP = async (mobile: string, otp: string): Promise<boolean> => {
  try {
    const response = await get<{ data: any[] }>('/ecom-users/otp', {
      'filters[mobile][$eq]': mobile,
      'filters[otp][$eq]': otp,
      'sort': 'createdAt:desc',
      'pagination[limit]': '1'
    });
    
    if (response.data.length === 0) return false;
    
    const otpRecord = response.data[0];
    const expiresAt = new Date(otpRecord.attributes.expiresAt);
    const now = new Date();
    
    return now <= expiresAt;
  } catch (error) {
    console.error('OTP verification failed:', error);
    return false;
  }
};