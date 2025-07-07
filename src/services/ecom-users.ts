import { post, get, put } from './api';

export interface EcomUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  otp?: string;
  otpExpiresAt?: string;
  isVerified?: boolean;
}

export interface EcomUserResponse {
  data: {
    id: number;
    attributes: EcomUser & {
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
    };
  };
}

export const createEcomUser = async (userData: EcomUser): Promise<EcomUserResponse> => {
  return post<EcomUserResponse>('/ecom-users', { data: userData });
};

export const getEcomUser = async (id: number): Promise<EcomUserResponse> => {
  return get<EcomUserResponse>(`/ecom-users/${id}`);
};

export const getEcomUserByPhone = async (phone: string) => {
  return get('/ecom-users', {
    'filters[phone][$eq]': phone
  });
};

export const updateEcomUser = async (id: number, data: Partial<EcomUser>): Promise<EcomUserResponse> => {
  return put<EcomUserResponse>(`/ecom-users/${id}`, { data });
};