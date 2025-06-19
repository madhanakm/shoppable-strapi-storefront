
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, mobile: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  verifyOTP: (mobile: string, otp: string) => Promise<boolean>;
  sendOTP: (mobile: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    if (email && password) {
      setUser({
        id: '1',
        name: 'Test User',
        email,
        mobile: '+1234567890'
      });
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, mobile: string, password: string): Promise<boolean> => {
    // Simulate API call
    if (name && email && mobile && password) {
      setUser({
        id: '1',
        name,
        email,
        mobile
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const sendOTP = async (mobile: string): Promise<boolean> => {
    // Simulate sending OTP
    console.log(`OTP sent to ${mobile}`);
    return true;
  };

  const verifyOTP = async (mobile: string, otp: string): Promise<boolean> => {
    // Simulate OTP verification
    return otp === '123456';
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      verifyOTP,
      sendOTP
    }}>
      {children}
    </AuthContext.Provider>
  );
};
