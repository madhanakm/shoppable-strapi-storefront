import { AuthResponse, StrapiResponse, StrapiSingleResponse } from '@/types/strapi';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.dharaniherbbals.com/api';

/**
 * Helper to get the auth token from localStorage
 */
const getToken = (): string | null => {
  return localStorage.getItem('jwt');
};

/**
 * Base fetch function with authentication and error handling
 */
async function fetchAPI<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {})
    }
  };

  const response = await fetch(`${API_URL}${endpoint}`, mergedOptions);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'An error occurred');
  }
  
  return await response.json();
}

/**
 * Generic GET request
 */
export async function get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = params 
    ? `${endpoint}?${new URLSearchParams(params).toString()}`
    : endpoint;
  
  return fetchAPI<T>(url);
}

/**
 * Generic POST request
 */
export async function post<T>(endpoint: string, data: any): Promise<T> {
  return fetchAPI<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Generic PUT request
 */
export async function put<T>(endpoint: string, data: any): Promise<T> {
  return fetchAPI<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

/**
 * Generic DELETE request
 */
export async function del<T>(endpoint: string): Promise<T> {
  return fetchAPI<T>(endpoint, {
    method: 'DELETE'
  });
}

/**
 * Authentication functions
 */
export const auth = {
  login: (identifier: string, password: string) => {
    return post<AuthResponse>('/auth/local', { identifier, password });
  },
  
  register: (username: string, email: string, password: string) => {
    return post<AuthResponse>('/auth/local/register', { username, email, password });
  },
  
  forgotPassword: (email: string) => {
    return post('/auth/forgot-password', { email });
  },
  
  resetPassword: (code: string, password: string, passwordConfirmation: string) => {
    return post('/auth/reset-password', { code, password, passwordConfirmation });
  }
};

/**
 * Helper to handle image URLs from Strapi
 */
export const getStrapiMedia = (url: string | null): string => {
  if (!url) return '';
  
  // If the URL is a full URL, return it as is
  if (url.startsWith('http')) {
    return url;
  }
  
  // If the URL is a relative URL, prepend the Strapi URL
  const strapiUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://api.dharaniherbbals.com';
  return `${strapiUrl}${url}`;
};