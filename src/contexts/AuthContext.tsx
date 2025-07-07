import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth } from '@/services/api';
import { User } from '@/types/strapi';
import { createEcomUser, getEcomUserByPhone, getEcomUser, updateEcomUser, EcomUser } from '@/services/ecom-users';
import { sendOTPViaSMS } from '@/services/backend-sms';
import { generateOTP } from '@/services/sms';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, mobile: string, password: string) => Promise<{ success: boolean; userId?: number }>;
  verifyOTP: (userId: number, mobile: string, otp: string) => Promise<boolean>;
  resendOTP: (mobile: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
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
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user data', error);
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Try to find user by email or phone
      let userResponse;
      
      // Check if identifier is email or phone
      if (identifier.includes('@')) {
        // Search by email
        const response = await fetch(`https://api.dharaniherbbals.com/api/ecom-users?filters[email][$eq]=${identifier}`);
        userResponse = await response.json();
      } else {
        // Search by phone
        userResponse = await getEcomUserByPhone(identifier);
      }
      if (userResponse.data && userResponse.data.length > 0) {
        const user = userResponse.data[0];
        if (user.attributes.password === password && user.attributes.isVerified) {
          // Store user info for session
          const userData = {
            id: user.id,
            username: user.attributes.name,
            email: user.attributes.email,
            phone: user.attributes.phone
          };
          
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData as any);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login failed', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, mobile: string, password: string): Promise<{ success: boolean; userId?: number }> => {
    try {
      setLoading(true);
      const otp = generateOTP();
      
      // Create user with OTP
      const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      const userData: EcomUser = {
        name,
        email,
        phone: mobile, // Store as phone field
        password,
        otp,
        otpExpiresAt,
        isVerified: false
      };
      
      console.log('Creating user with data:', {
        ...userData,
        password: '[HIDDEN]'
      });
      
      const userResponse = await createEcomUser(userData);
      console.log('User created response:', userResponse);
      
      // Log OTP for testing
      console.log('Generated OTP for mobile', mobile, ':', otp);
      
      // Send SMS
      try {
        await sendOTPViaSMS(mobile, otp);
      } catch (smsError) {
        console.warn('SMS sending failed:', smsError);
      }
      
      return { success: true, userId: userResponse.data.id };
    } catch (error) {
      console.error('Registration failed', error);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (userId: number, mobile: string, otp: string): Promise<boolean> => {
    try {
      setLoading(true);
      const userResponse = await getEcomUser(userId);
      const user = userResponse.data.attributes;
      
      console.log('OTP Verification:', {
        enteredOTP: otp,
        storedOTP: user.otp,
        expiresAt: user.otpExpiresAt,
        currentTime: new Date().toISOString(),
        isExpired: new Date() > new Date(user.otpExpiresAt || '')
      });
      
      if (user.otp === otp && new Date() <= new Date(user.otpExpiresAt || '')) {
        await updateEcomUser(userId, { isVerified: true });
        console.log('OTP verification successful');
        return true;
      }
      
      console.log('OTP verification failed: mismatch or expired');
      return false;
    } catch (error) {
      console.error('OTP verification failed', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async (mobile: string): Promise<boolean> => {
    try {
      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      
      const userResponse = await getEcomUserByPhone(mobile);
      if (userResponse.data && userResponse.data.length > 0) {
        const userId = userResponse.data[0].id;
        await updateEcomUser(userId, { otp, otpExpiresAt });
        return await sendOTPViaSMS(mobile, otp);
      }
      return false;
    } catch (error) {
      console.error('Resend OTP failed', error);
      return false;
    }
  };



  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    setUser(null);
    // Redirect to home page after logout
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      verifyOTP,
      resendOTP,
      logout,
      isAuthenticated: !!user,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};