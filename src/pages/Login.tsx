import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetFlow, setResetFlow] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [userPhone, setUserPhone] = useState('');
  const { login, isAuthenticated, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      navigate(redirect === 'checkout' ? '/checkout' : '/');
    }
  }, [isAuthenticated, navigate]);
  
  // Don't render if authenticated
  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      // Check if this is a migrated user that needs password reset
      if (result && typeof result === 'object' && result.requirePasswordReset) {
        // Start password reset flow
        setUserId(result.userId);
        setUserPhone(result.phone);
        setResetFlow(true);
        
        // Send OTP
        await resendOTP(result.phone);
        
        toast({
          title: "Password Has Expired",
          description: "Your password has expired. Please set a new password using the OTP sent to your phone.",
        });
      } else if (result === true) {
        // Normal successful login
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        
        // Check for redirect parameter
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        navigate(redirect === 'checkout' ? '/checkout' : '/');
      } else {
        // Login failed
        toast({
          title: "Error",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!userId) {
        throw new Error("User ID is missing");
      }
      
      // Verify OTP
      const otpVerified = await verifyOTP(userId, userPhone, otp);
      
      if (otpVerified) {
        // Update user's password
        const response = await fetch(`https://api.dharaniherbbals.com/api/ecom-users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: { password: newPassword }
          })
        });
        
        if (response.ok) {
          toast({
            title: "Password Updated",
            description: "Your new password has been set. You can now log in.",
          });
          
          // Reset form to login state
          setResetFlow(false);
          setPassword(newPassword); // Pre-fill password for convenience
        } else {
          throw new Error("Failed to update password");
        }
      } else {
        toast({
          title: "Invalid OTP",
          description: "The OTP you entered is incorrect or expired.",
          variant: "destructive",
        });
      }
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
  
  const handleResendOTP = async () => {
    if (userPhone) {
      await resendOTP(userPhone);
      toast({
        title: "OTP Sent",
        description: "A new OTP has been sent to your phone.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-green-50">
      <SEOHead 
        title="Login"
        description="Sign in to your Dharani Herbbals account to access your orders, wishlist, and personalized shopping experience."
        url="/login"
      />
      <Header />
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-md mx-auto">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-green-500/10 rounded-t-lg">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-green-500 rounded-full mb-6 shadow-lg">
                  <LogIn className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent mb-2">
                  Welcome Back
                </CardTitle>
                <p className="text-gray-600">
                  Sign in to your account to continue
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="p-8 md:p-10">
              {!resetFlow ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                      Email or Phone
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email or phone"
                        className="pl-12 h-12 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
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
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                        className="pl-12 pr-12 h-12 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
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
                  
                  <div className="flex items-center justify-between">
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full h-12 bg-gradient-to-r from-primary to-green-500 hover:from-primary/90 hover:to-green-600 shadow-lg text-lg font-semibold transition-all"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-6">
                  <div className="bg-amber-50 p-4 rounded-lg mb-6">
                    <p className="text-amber-800 text-sm">
                      Your password has expired. Please set a new password to continue. We've sent an OTP to your phone number ending with {userPhone.slice(-4)}.
                    </p>
                  </div>
                  
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
                      placeholder="Enter OTP sent to your phone"
                      className="h-12 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
                    />
                    <button 
                      type="button" 
                      onClick={handleResendOTP}
                      className="text-sm text-primary mt-2 hover:underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                  
                  <div>
                    <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="Enter new password"
                        className="pl-12 pr-12 h-12 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all"
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
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full h-12 bg-gradient-to-r from-primary to-green-500 hover:from-primary/90 hover:to-green-600 shadow-lg text-lg font-semibold transition-all"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Setting Password...
                      </>
                    ) : (
                      "Set New Password"
                    )}
                  </Button>
                  
                  <button 
                    type="button" 
                    onClick={() => setResetFlow(false)}
                    className="w-full text-center text-sm text-gray-600 hover:text-gray-800 mt-4"
                  >
                    Back to Login
                  </button>
                </form>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Don't have an account?
                  </p>
                  <Link to="/register">
                    <Button 
                      variant="outline" 
                      className="w-full border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 transition-all"
                    >
                      Create New Account
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-green-600 font-semibold text-sm">🔒</div>
                  <div className="text-xs text-green-700 mt-1">Secure</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-blue-600 font-semibold text-sm">⚡</div>
                  <div className="text-xs text-blue-700 mt-1">Fast</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-purple-600 font-semibold text-sm">🛡️</div>
                  <div className="text-xs text-purple-700 mt-1">Protected</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;