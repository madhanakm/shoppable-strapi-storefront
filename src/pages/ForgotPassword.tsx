import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Phone, ArrowLeft, Shield, CheckCircle, Key } from 'lucide-react';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';
import { getEcomUserByPhone, updateEcomUser } from '@/services/ecom-users';
import { sendOTPViaSMS } from '@/services/backend-sms';
import { generateOTP } from '@/services/sms';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: New Password
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // Don't render if authenticated
  if (isAuthenticated) {
    return null;
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if user exists
      const userResponse = await getEcomUserByPhone(phone);
      if (userResponse.data && userResponse.data.length > 0) {
        const user = userResponse.data[0];
        setUserId(user.id);
        
        // Generate and send OTP
        const generatedOTP = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        
        await updateEcomUser(user.id, { 
          otp: generatedOTP, 
          otpExpiresAt 
        });
        
        // Send SMS
        try {
          await sendOTPViaSMS(phone, generatedOTP);
        } catch (smsError) {
          // SMS sending failed
        }
        
        
        
        setStep(2);
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the verification code.",
        });
      } else {
        toast({
          title: "User Not Found",
          description: "No account found with this phone number.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userResponse = await fetch(`https://api.dharaniherbbals.com/api/ecom-users/${userId}`);
      const userData = await userResponse.json();
      const user = userData.data.attributes;
      
      if (user.otp === otp && new Date() <= new Date(user.otpExpiresAt || '')) {
        // Mark user as verified since OTP is confirmed
        await updateEcomUser(userId, { isVerified: true });
        setStep(3);
        toast({
          title: "OTP Verified",
          description: "Please set your new password.",
        });
      } else {
        toast({
          title: "Invalid OTP",
          description: "The OTP is incorrect or has expired.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "OTP verification failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await updateEcomUser(userId, { 
        password: newPassword,
        otp: null,
        otpExpiresAt: null
      });
      
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated successfully.",
      });
      
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setIsLoading(true);
    try {
      const generatedOTP = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      
      await updateEcomUser(userId, { 
        otp: generatedOTP, 
        otpExpiresAt 
      });
      
      await sendOTPViaSMS(phone, generatedOTP);
      
      
      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your phone.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend OTP.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <SEOHead 
        title="Reset Password"
        description="Reset your Dharani Herbbals account password securely using OTP verification."
        url="/forgot-password"
      />
      <Header />
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-md mx-auto">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-t-lg">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
                  {step === 1 && <Phone className="w-8 h-8 text-white" />}
                  {step === 2 && <Shield className="w-8 h-8 text-white" />}
                  {step === 3 && <Key className="w-8 h-8 text-white" />}
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800">
                  {step === 1 && 'Reset Password'}
                  {step === 2 && 'Verify OTP'}
                  {step === 3 && 'New Password'}
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  {step === 1 && 'Enter your phone number to receive OTP'}
                  {step === 2 && 'Enter the OTP sent to your phone'}
                  {step === 3 && 'Create your new password'}
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="p-8 md:p-10">
              {/* Step 1: Phone Number */}
              {step === 1 && (
                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="Enter your phone number"
                        className="pl-12 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg text-lg font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending OTP...
                      </>
                    ) : (
                      'Send OTP'
                    )}
                  </Button>
                </form>
              )}

              {/* Step 2: OTP Verification */}
              {step === 2 && (
                <form onSubmit={handleOTPSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="otp" className="text-sm font-medium text-gray-700 mb-2 block">
                      Enter OTP
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      placeholder="Enter 6-digit OTP"
                      className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      OTP sent to {phone}
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg text-lg font-semibold"
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={resendOTP}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Resend OTP
                  </Button>
                </form>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <form onSubmit={handlePasswordReset} className="space-y-6">
                  <div>
                    <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      minLength={6}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      minLength={6}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg text-lg font-semibold"
                  >
                    {isLoading ? 'Updating...' : 'Reset Password'}
                  </Button>
                </form>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <Link to="/login">
                    <Button variant="outline" className="w-full border-2 border-gray-300 hover:bg-gray-50">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Security Notice */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                  🔒 OTP expires in 30 minutes for security
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;