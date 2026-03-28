import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Phone, Shield, ArrowLeft } from 'lucide-react';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';
import { getEcomUserByPhone, updateEcomUser } from '@/services/ecom-users';
import { sendOTPViaSMS } from '@/services/backend-sms';
import { generateOTP } from '@/services/sms';

const OTPLogin = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const redirectParam = new URLSearchParams(window.location.search).get('redirect');
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);
  
  if (isAuthenticated) {
    return null;
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userResponse = await getEcomUserByPhone(phone);
      if (userResponse.data && userResponse.data.length > 0) {
        const user = userResponse.data[0];
        setUserId(user.id);
        
        const generatedOTP = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        
        await updateEcomUser(user.id, { 
          loginOtp: generatedOTP,
          loginOtpExpiresAt: otpExpiresAt,
          loginOtpAttempts: 0
        });
        
        try {
          await sendOTPViaSMS(phone, generatedOTP, 'login');
        } catch (smsError) {
          console.error('SMS sending failed:', smsError);
        }
        
        setStep(2);
        setResendTimer(20);
        setOtpTimer(1800);
        toast({
          title: isTamil ? "OTP அனுப்பப்பட்டது" : "OTP Sent",
          description: isTamil ? "உங்கள் ஃபோனுக்கு சரிபார்ப்பு குறியீடு அனுப்பப்பட்டுள்ளது." : "Please check your phone for the verification code.",
        });
      } else {
        toast({
          title: isTamil ? "பயனர் கண்டுபிடிக்கப்படவில்லை" : "User Not Found",
          description: isTamil ? "இந்த ஃபோன் எண்ணுடன் கணக்கு கிடைக்கவில்லை." : "No account found with this phone number.",
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
    
    if (!otp.trim() || otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userResponse = await fetch(`https://api.dharaniherbbals.com/api/ecom-users/${userId}`);
      const userData = await userResponse.json();
      const user = userData.data.attributes;
      
      if (user.loginOtp === otp && new Date() <= new Date(user.loginOtpExpiresAt || '')) {
        const attempts = (user.loginOtpAttempts || 0) + 1;
        if (attempts > 5) {
          toast({
            title: "Too Many Attempts",
            description: "Please try again later.",
            variant: "destructive",
          });
          return;
        }
        
        await updateEcomUser(userId, { 
          loginOtp: null,
          loginOtpExpiresAt: null,
          loginOtpAttempts: 0,
          isVerified: true
        });

        const userData = {
          id: userId,
          username: user.name,
          email: user.email,
          phone: user.phone,
          userType: user.userType || 'customer'
        };
        localStorage.setItem('user', JSON.stringify(userData));
        window.dispatchEvent(new Event('storage'));
        
        toast({
          title: isTamil ? "வெற்றிகரமாக உள்நுழைந்தீர்கள்" : "Login Successful",
          description: isTamil ? "உங்கள் கணக்கில் வெற்றிகரமாக உள்நுழைந்துவிட்டீர்கள்." : "You have been successfully logged in.",
        });
        
        navigate(redirectParam === 'checkout' ? '/checkout' : '/');
      } else {
        await updateEcomUser(userId, { 
          loginOtpAttempts: (user.loginOtpAttempts || 0) + 1
        });
        
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

  const resendOTP = async () => {
    if (resendTimer > 0) {
      toast({
        title: "Please Wait",
        description: `You can resend OTP in ${resendTimer} seconds.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const generatedOTP = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      
      await updateEcomUser(userId!, { 
        loginOtp: generatedOTP,
        loginOtpExpiresAt: otpExpiresAt,
        loginOtpAttempts: 0
      });
      
      await sendOTPViaSMS(phone, generatedOTP, 'login');
      
      setOtp('');
      setResendTimer(20);
      setOtpTimer(1800);
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
        title="OTP Login"
        description="Login to your Dharani Herbbals account using OTP verification."
        url="/otp-login"
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
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800">
                  {step === 1 && (isTamil ? 'OTP உள்நுழைவு' : 'OTP Login')}
                  {step === 2 && (isTamil ? 'OTP சரிபார்ப்பு' : 'Verify OTP')}
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  {step === 1 && (isTamil ? 'OTP பெற உங்கள் ஃபோன் எண்ணை உள்ளிடவும்' : 'Enter your phone number to receive OTP')}
                  {step === 2 && (isTamil ? 'உங்கள் ஃபோனுக்கு அனுப்பப்பட்ட OTP ஐ உள்ளிடவும்' : 'Enter the OTP sent to your phone')}
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="p-8 md:p-10">
              {step === 1 && (
                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                      {isTamil ? 'ஃபோன் எண்' : 'Phone Number'}
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder={isTamil ? "உங்கள் ஃபோன் எண்ணை உள்ளிடவும்" : "Enter your phone number"}
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
                        {isTamil ? 'OTP அனுப்பப்படுகிறது...' : 'Sending OTP...'}
                      </>
                    ) : (
                      isTamil ? 'OTP அனுப்பவும்' : 'Send OTP'
                    )}
                  </Button>

                  <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full border border-gray-300 transition-colors">
                    🔑 {isTamil ? 'கடவுச்சொல்லுடன் உள்நுழைக' : 'Login with Password instead'}
                  </Link>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleOTPSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="otp" className="text-sm font-medium text-gray-700 mb-2 block">
                      {isTamil ? 'OTP ஐ உள்ளிடவும்' : 'Enter OTP'}
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      placeholder={isTamil ? "6 இலக்க OTP ஐ உள்ளிடவும்" : "Enter 6-digit OTP"}
                      className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 text-center text-lg tracking-widest font-mono"
                      maxLength={6}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {isTamil ? 'OTP அனுப்பப்பட்டது' : 'OTP sent to'} {phone}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">
                      {otpTimer > 0 ? (
                        <span className="text-orange-600">
                          {isTamil ? 'OTP இல் காலாவதி ஆகிறது:' : 'OTP expires in:'} {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, '0')}
                        </span>
                      ) : (
                        <span className="text-red-600">{isTamil ? 'OTP காலாவதி ஆகிவிட்டது' : 'OTP Expired'}</span>
                      )}
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading || otp.length !== 6} 
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg text-lg font-semibold"
                  >
                    {isLoading ? (isTamil ? 'சரிபார்க்கப்படுகிறது...' : 'Verifying...') : (isTamil ? 'OTP சரிபார்க்கவும்' : 'Verify OTP')}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={resendOTP}
                    disabled={isLoading || resendTimer > 0}
                    className="w-full"
                  >
                    {resendTimer > 0 ? `${isTamil ? 'மீண்டும் அனுப்பவும்' : 'Resend OTP'} (${resendTimer}s)` : (isTamil ? 'மீண்டும் அனுப்பவும்' : 'Resend OTP')}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="ghost"
                    onClick={() => {
                      setStep(1);
                      setPhone('');
                      setOtp('');
                      setOtpTimer(0);
                    }}
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {isTamil ? 'மாற்றவும்' : 'Change Phone'}
                  </Button>
                </form>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {isTamil ? 'கணக்கு இல்லையா?' : "Don't have an account?"}
                    <Link to="/register" className="text-green-600 font-semibold hover:text-green-700 ml-1">
                      {isTamil ? 'பதிவு செய்யவும்' : 'Register'}
                    </Link>
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-700 text-center">
                  🔒 {isTamil ? 'OTP 30 நிமிடங்களுக்கு செல்லுபடி ஆகும்' : 'OTP expires in 30 minutes for security'}
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

export default OTPLogin;
