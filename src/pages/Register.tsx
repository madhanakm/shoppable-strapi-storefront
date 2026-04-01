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
import { User, Mail, Phone, Lock, UserPlus, Eye, EyeOff, Shield, CheckCircle, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/components/TranslationProvider';

const Register = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  const { register, verifyOTP, resendOTP, isAuthenticated, loginWithUserData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { translate } = useTranslation();
  const t = translate;

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!resendTimer) return;
    const t = setInterval(() => setResendTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  if (isAuthenticated) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Password Mismatch', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const result = await register(formData.name, formData.email, formData.mobile, formData.password);
      if (result.success) {
        setUserId(result.userId);
        setStep(2);
        setResendTimer(20);
        toast({ title: 'OTP Sent', description: 'Please verify your phone number with the OTP sent to you.' });
      } else {
        toast({ title: 'Registration Failed', description: result.message || 'Please try again.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Registration failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await verifyOTP(userId!, formData.mobile, otp);
      if (success) {
        // Fetch user data and auto-login
        const res = await fetch(`https://api.dharaniherbbals.com/api/ecom-users/${userId}`);
        const data = await res.json();
        const user = data.data?.attributes;
        if (user) {
          loginWithUserData({ id: userId!, username: user.name, email: user.email, phone: user.phone, userType: user.userType || 'customer' });
        }
        toast({ title: 'Account Created!', description: 'Welcome to Dharani Herbbals!' });
        navigate('/');
      } else {
        toast({ title: 'Invalid OTP', description: 'The OTP is incorrect or has expired.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'OTP verification failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      const success = await resendOTP(formData.mobile);
      if (success) {
        setResendTimer(20);
        toast({ title: 'OTP Resent', description: 'A new OTP has been sent to your phone.' });
      } else {
        toast({ title: 'Error', description: 'Failed to resend OTP.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to resend OTP.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <SEOHead
        title="Create Account"
        description="Join Dharani Herbbals and create your account to access exclusive offers, track orders, and enjoy personalized shopping."
        url="/register"
      />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-t-lg p-6 pb-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-3 shadow-lg">
                  {step === 1 ? <UserPlus className="w-8 h-8 text-white" /> : <Shield className="w-8 h-8 text-white" />}
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent leading-tight">
                  {step === 1 ? t('register.createAccount') : t('register.verifyPhone')}
                </CardTitle>
                <p className="text-gray-500 text-sm mt-1">
                  {step === 1 ? t('register.joinUs') : `${t('register.otpSentTo')} ${formData.mobile}`}
                </p>
              </div>
            </CardHeader>

            <CardContent className="p-6 md:p-8">
              {step === 1 ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1 block">{t('register.name')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange}
                        required placeholder={t('register.namePlaceholder')} className="pl-10 h-11 border-gray-200 focus:border-green-500" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">{t('register.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange}
                        required placeholder={t('register.emailPlaceholder')} className="pl-10 h-11 border-gray-200 focus:border-green-500" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="mobile" className="text-sm font-medium text-gray-700 mb-1 block">{t('register.phone')}</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="mobile" name="mobile" type="tel" value={formData.mobile} onChange={handleInputChange}
                        required placeholder={t('register.phonePlaceholder')} className="pl-10 h-11 border-gray-200 focus:border-green-500" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{t('register.phoneHint')}</p>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1 block">{t('register.password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="password" name="password" type={showPassword ? 'text' : 'password'}
                        value={formData.password} onChange={handleInputChange} required
                        placeholder={t('register.passwordHint')} className="pl-10 pr-10 h-11 border-gray-200 focus:border-green-500" minLength={6} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-1 block">{t('register.confirmPassword')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword} onChange={handleInputChange} required
                        placeholder={t('register.confirmPasswordHint')} className="pl-10 pr-10 h-11 border-gray-200 focus:border-green-500" minLength={6} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading}
                    className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg font-semibold mt-2">
                    {isLoading
                      ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />{t('register.creatingAccount')}</>
                      : <><UserPlus className="w-4 h-4 mr-2" />{t('register.registerButton')}</>}
                  </Button>

                  <div className="pt-4 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-600">
                      {t('register.haveAccount')}{' '}
                      <Link to="/otp-login" className="text-green-600 font-semibold hover:text-green-700">{t('register.login')}</Link>
                    </p>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleOTPSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="otp" className="text-sm font-medium text-gray-700 mb-1 block">{t('register.enterOtp')}</Label>
                    <Input id="otp" type="text" value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required placeholder={t('register.otpPlaceholder')}
                      className="h-11 border-gray-200 focus:border-green-500 text-center text-lg tracking-widest font-mono" maxLength={6} />
                  </div>

                  <Button type="submit" disabled={isLoading || otp.length !== 6}
                    className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg font-semibold">
                    {isLoading
                      ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />{t('register.verifying')}</>
                      : <><CheckCircle className="w-4 h-4 mr-2" />{t('register.verifyComplete')}</>}
                  </Button>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => { setStep(1); setOtp(''); }}
                      className="flex-1 h-11 border-gray-200">
                      <ArrowLeft className="w-4 h-4 mr-1" />{t('register.back')}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleResendOTP}
                      disabled={isLoading || resendTimer > 0} className="flex-1 h-11 border-gray-200 text-green-600">
                      {resendTimer > 0 ? `${t('register.resendOtp')} (${resendTimer}s)` : t('register.resendOtp')}
                    </Button>
                  </div>
                </form>
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
