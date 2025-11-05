export interface StrapiResponse<T> {
  data: StrapiData<T>[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiData<T> {
  id: number;
  attributes: T;
}

export interface StrapiSingleResponse<T> {
  data: StrapiData<T>;
  meta: {};
}

export interface Product {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  category: string;
  badge?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  image: {
    data: {
      id: number;
      attributes: {
        url: string;
        formats: {
          thumbnail: { url: string };
          small: { url: string };
          medium: { url: string };
        };
      };
    };
  };
}

export enum UserType {
  CUSTOMER = 'customer',
  DEALER = 'dealer',
  DISTRIBUTOR = 'distributor',
  ADMIN = 'admin'
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  userType?: UserType;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  jwt: string;
  user: User;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
}

export interface Category {
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}