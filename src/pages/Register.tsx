import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Lock, UserPlus, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';

const Register = () => {
  const [step, setStep] = useState(1); // 1: Registration, 2: OTP Verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const { register, verifyOTP, resendOTP, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(formData.name, formData.email, formData.mobile, formData.password);
      if (result.success) {
        setUserId(result.userId);
        setStep(2);
        toast({
          title: "Registration Successful",
          description: "Please verify your phone number with the OTP sent to you.",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: "Please try again or contact support.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Registration failed. Please try again.",
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
      const success = await verifyOTP(userId, formData.mobile, otp);
      if (success) {
        toast({
          title: "Account Verified",
          description: "Your account has been created successfully!",
        });
        navigate('/login');
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

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const success = await resendOTP(formData.mobile);
      if (success) {
        toast({
          title: "OTP Resent",
          description: "A new OTP has been sent to your phone.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to resend OTP.",
          variant: "destructive",
        });
      }
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
      <Header />
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-md mx-auto">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-t-lg">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6 shadow-lg">
                  {step === 1 ? <UserPlus className="w-10 h-10 text-white" /> : <Shield className="w-10 h-10 text-white" />}
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  {step === 1 ? 'Create Account' : 'Verify Phone'}
                </CardTitle>
                <p className="text-gray-600">
                  {step === 1 ? 'Join us and start your herbal journey' : 'Enter the OTP sent to your phone'}
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="p-8 md:p-10">
              {step === 1 ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your full name"
                        className="pl-12 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your email"
                        className="pl-12 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="mobile" className="text-sm font-medium text-gray-700 mb-2 block">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="mobile"
                        name="mobile"
                        type="tel"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your phone number"
                        className="pl-12 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder="Create a password"
                        className="pl-12 pr-12 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        placeholder="Confirm your password"
                        className="pl-12 pr-12 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg text-lg font-semibold transition-all"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>
              ) : (
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
                      className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500/20 text-center text-lg tracking-widest transition-all"
                      maxLength={6}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      OTP sent to {formData.mobile}
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg text-lg font-semibold transition-all"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Verify & Complete
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="w-full border-2 border-green-300 text-green-600 hover:bg-green-50 transition-all"
                  >
                    Resend OTP
                  </Button>
                </form>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Already have an account?
                  </p>
                  <Link to="/login">
                    <Button 
                      variant="outline" 
                      className="w-full border-2 border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 transition-all"
                    >
                      Sign In Instead
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Security Notice */}
              {step === 1 && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-800 text-center">
                    🔒 Your information is secure and encrypted
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;