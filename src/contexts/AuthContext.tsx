import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth } from '@/services/api';
import { User } from '@/types/strapi';
import { createEcomUser, getEcomUserByPhone, getEcomUser, updateEcomUser, EcomUser } from '@/services/ecom-users';
import { sendOTPViaSMS } from '@/services/backend-sms';
import { generateOTP } from '@/services/sms';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean | { requirePasswordReset: boolean; userId: number; phone: string } | { requireOTPVerification: boolean; userId: number; phone: string }>;
  register: (name: string, email: string, mobile: string, password: string) => Promise<{ success: boolean; userId?: number; message?: string }>;
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
    const validateUser = async () => {
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          
          // Only validate if user data has required fields
          if (userData.id && userData.username && userData.email) {
            setUser(userData);
          } else {
            // Invalid user data, clear storage
            localStorage.removeItem('user');
            localStorage.removeItem('loginTime');
            localStorage.removeItem('lastActivity');
          }
        } catch (error) {
          // JSON parse error, clear corrupted data
          localStorage.removeItem('user');
          localStorage.removeItem('loginTime');
          localStorage.removeItem('lastActivity');
        }
      }
      
      setLoading(false);
    };
    
    validateUser();
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean | { requirePasswordReset: boolean; userId: number; phone: string } | { requireOTPVerification: boolean; userId: number; phone: string }> => {
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
        
        // Check if this is a migrated user with empty password
        if (user.attributes.password === '' || user.attributes.password === null) {
          // Return special response for migrated users that need password reset
          return { 
            requirePasswordReset: true, 
            userId: user.id, 
            phone: user.attributes.phone 
          };
        }
        
        // Check if password matches
        if (user.attributes.password === password) {
          // Check if user is verified
          if (!user.attributes.isVerified) {
            // User not verified, send OTP and ask for verification
            const otp = generateOTP();
            const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
            
            await updateEcomUser(user.id, { otp, otpExpiresAt });
            
            try {
              await sendOTPViaSMS(user.attributes.phone, otp);
            } catch (smsError) {
              // SMS sending failed but continue
            }
            
            return {
              requireOTPVerification: true,
              userId: user.id,
              phone: user.attributes.phone
            };
          }
          
          // Store user data permanently (no expiry)
          const userData = {
            id: user.id,
            username: user.attributes.name,
            email: user.attributes.email,
            phone: user.attributes.phone,
            userType: user.attributes.userType || 'customer'
          };
          
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData as any);
          
          // Send user data to Meta Pixel
          if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('setUserProperties', {
              em: user.attributes.email,
              ph: user.attributes.phone,
              fn: user.attributes.name
            });
          }
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      // Error handling
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, mobile: string, password: string): Promise<{ success: boolean; userId?: number; message?: string }> => {
    console.log('Register function called with:', { name, email, mobile });
    try {
      setLoading(true);
      
      // Check if email already exists
      console.log('Checking email...');
      const emailResponse = await fetch(`https://api.dharaniherbbals.com/api/ecom-users?filters[email][$eq]=${email}`);
      const emailData = await emailResponse.json();
      console.log('Email check result:', emailData);
      if (emailData.data && emailData.data.length > 0) {
        const existingUser = emailData.data[0];
        console.log('Email exists, checking verification status:', existingUser.attributes.isVerified);
        
        // If user exists but not verified, resend OTP and allow to continue
        if (!existingUser.attributes.isVerified) {
          console.log('User not verified, resending OTP');
          const otp = generateOTP();
          const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
          
          // Update existing user with new OTP and password
          await updateEcomUser(existingUser.id, { otp, otpExpiresAt, password });
          
          // Send SMS
          try {
            await sendOTPViaSMS(existingUser.attributes.phone, otp);
          } catch (smsError) {
            console.error('SMS send error:', smsError);
          }
          
          console.log('Returning success with userId:', existingUser.id);
          return { success: true, userId: existingUser.id, message: 'Account not verified. OTP has been resent to your mobile number.' };
        }
        
        console.log('Email already exists and verified');
        return { success: false, message: 'Email address already exists and is verified. Please login instead.' };
      }
      
      // Check if phone already exists
      console.log('Checking phone...');
      const phoneResponse = await getEcomUserByPhone(mobile);
      console.log('Phone check response:', phoneResponse);
      if (phoneResponse.data && phoneResponse.data.length > 0) {
        const existingUser = phoneResponse.data[0];
        console.log('Existing user found:', { id: existingUser.id, isVerified: existingUser.attributes.isVerified });
        
        // If user exists but not verified, resend OTP and allow to continue
        if (!existingUser.attributes.isVerified) {
          console.log('User not verified, resending OTP');
          const otp = generateOTP();
          const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
          
          // Update existing user with new OTP and password
          await updateEcomUser(existingUser.id, { otp, otpExpiresAt, password });
          
          // Send SMS
          try {
            await sendOTPViaSMS(mobile, otp);
          } catch (smsError) {
            console.error('SMS send error:', smsError);
          }
          
          console.log('Returning success with userId:', existingUser.id);
          return { success: true, userId: existingUser.id, message: 'Account not verified. OTP has been resent to your mobile number.' };
        }
        
        console.log('User already verified');
        return { success: false, message: 'Mobile number already exists and is verified. Please login instead.' };
      }
      
      console.log('Creating new user...');
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
      
      const userResponse = await createEcomUser(userData);
      console.log('User created:', userResponse.data.id);
      
      // Send SMS
      try {
        await sendOTPViaSMS(mobile, otp);
      } catch (smsError) {
        console.error('SMS send error:', smsError);
      }
      
      return { success: true, userId: userResponse.data.id };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (userId: number, mobile: string, otp: string): Promise<boolean> => {
    try {
      setLoading(true);
      const userResponse = await getEcomUser(userId);
      const user = userResponse.data.attributes;
      
      // OTP Verification
      // console.log('OTP Verification:', {
      //   enteredOTP: otp,
      //   storedOTP: user.otp,
      //   expiresAt: user.otpExpiresAt,
      //   currentTime: new Date().toISOString(),
      //   isExpired: new Date() > new Date(user.otpExpiresAt || '')
      // });
      
      if (user.otp === otp && new Date() <= new Date(user.otpExpiresAt || '')) {
        await updateEcomUser(userId, { isVerified: true });
        
        return true;
      }
      
      
      return false;
    } catch (error) {
      
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
      
      return false;
    }
  };



  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime'); // Clean up old timestamp if exists
    localStorage.removeItem('lastActivity'); // Clean up old timestamp if exists
    // Clear guest data as well
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    setUser(null);
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