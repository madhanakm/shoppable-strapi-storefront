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
import { Phone, Shield, ArrowLeft, UserPlus, User, Mail } from 'lucide-react';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';
import { getEcomUserByPhone, updateEcomUser, createEcomUser } from '@/services/ecom-users';
import { sendOTPViaSMS } from '@/services/backend-sms';
import { generateOTP } from '@/services/sms';

// step 1 = enter phone
// step 1.5 = new user — enter name + email
// step 2 = enter OTP

const OTPLogin = () => {
  const [step, setStep] = useState<1 | 1.5 | 2>(1);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);

  const { toast } = useToast();
  const { isAuthenticated, loginWithUserData } = useAuth();
  const navigate = useNavigate();
  const { language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const redirectParam = new URLSearchParams(window.location.search).get('redirect');

  useEffect(() => {
    if (isAuthenticated && !redirectParam) navigate('/');
  }, [isAuthenticated, navigate, redirectParam]);

  useEffect(() => {
    if (!otpTimer) return;
    const t = setInterval(() => setOtpTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [otpTimer]);

  useEffect(() => {
    if (!resendTimer) return;
    const t = setInterval(() => setResendTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  if (isAuthenticated && !redirectParam) return null;

  // ── Step 1: Check phone ──────────────────────────────────────────
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setIsLoading(true);
    try {
      const res = await getEcomUserByPhone(phone);
      if (res?.data?.length > 0) {
        // Existing user → send OTP directly
        const user = res.data[0];
        setUserId(user.id);
        setIsNewUser(false);
        await sendLoginOTP(user.id, phone);
        setStep(2);
      } else {
        // New user → ask for name + email
        setIsNewUser(true);
        setStep(1.5);
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 1.5: New user details → create account + send OTP ───────
  const handleNewUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setIsLoading(true);
    try {
      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      const created = await createEcomUser({
        name: name.trim(),
        email: email.trim(),
        phone,
        password: '',
        loginOtp: otp,
        loginOtpExpiresAt: otpExpiresAt,
        loginOtpAttempts: 0,
        isVerified: false,
      });
      setUserId(created.data.id);
      await sendOTPViaSMS(phone, otp, 'registration');
      setStep(2);
      setResendTimer(20);
      setOtpTimer(1800);
      toast({ title: isTamil ? 'OTP அனுப்பப்பட்டது' : 'OTP Sent', description: isTamil ? 'உங்கள் ஃபோனுக்கு OTP அனுப்பப்பட்டது.' : 'OTP sent to your phone.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to create account. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Helper: send login OTP to existing user ───────────────────────
  const sendLoginOTP = async (uid: number, mobile: string) => {
    const generatedOTP = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    await updateEcomUser(uid, { loginOtp: generatedOTP, loginOtpExpiresAt: otpExpiresAt, loginOtpAttempts: 0 });
    try { await sendOTPViaSMS(mobile, generatedOTP, 'login'); } catch {}
    setResendTimer(20);
    setOtpTimer(1800);
    toast({ title: isTamil ? 'OTP அனுப்பப்பட்டது' : 'OTP Sent', description: isTamil ? 'உங்கள் ஃபோனுக்கு OTP அனுப்பப்பட்டது.' : 'OTP sent to your phone.' });
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────
  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setIsLoading(true);
    try {
      const res = await fetch(`https://api.dharaniherbbals.com/api/ecom-users/${userId}`);
      const data = await res.json();
      const user = data.data.attributes;

      if (user.loginOtp === otp && new Date() <= new Date(user.loginOtpExpiresAt || '')) {
        await updateEcomUser(userId!, { loginOtp: null, loginOtpExpiresAt: null, loginOtpAttempts: 0, isVerified: true });
        loginWithUserData({ id: userId!, username: user.name, email: user.email, phone: user.phone, userType: user.userType || 'customer' });
        toast({
          title: isNewUser ? (isTamil ? 'கணக்கு உருவாக்கப்பட்டது!' : 'Account Created!') : (isTamil ? 'வெற்றிகரமாக உள்நுழைந்தீர்கள்' : 'Login Successful'),
          description: isNewUser ? (isTamil ? 'தரணி ஹெர்பல்ஸுக்கு வரவேற்கிறோம்!' : 'Welcome to Dharani Herbbals!') : (isTamil ? 'வெற்றிகரமாக உள்நுழைந்துவிட்டீர்கள்.' : 'You have been successfully logged in.'),
        });
        navigate(redirectParam === 'checkout' ? '/checkout' : '/');
      } else {
        await updateEcomUser(userId!, { loginOtpAttempts: (user.loginOtpAttempts || 0) + 1 });
        toast({ title: 'Invalid OTP', description: 'The OTP is incorrect or has expired.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'OTP verification failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      await sendLoginOTP(userId!, phone);
      setOtp('');
    } catch {
      toast({ title: 'Error', description: 'Failed to resend OTP.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // ── UI ────────────────────────────────────────────────────────────
  const stepTitle = () => {
    if (step === 1) return isTamil ? 'OTP உள்நுழைவு / பதிவு' : 'Login / Register';
    if (step === 1.5) return isTamil ? 'புதிய கணக்கு' : 'Create Account';
    return isTamil ? 'OTP சரிபார்ப்பு' : 'Verify OTP';
  };

  const stepSubtitle = () => {
    if (step === 1) return isTamil ? 'உங்கள் ஃபோன் எண்ணை உள்ளிடவும்' : 'Enter your phone number to continue';
    if (step === 1.5) return isTamil ? 'உங்கள் விவரங்களை நிரப்பவும்' : 'Complete your details to create an account';
    return isTamil ? 'உங்கள் ஃபோனுக்கு அனுப்பப்பட்ட OTP ஐ உள்ளிடவும்' : 'Enter the OTP sent to your phone';
  };

  const stepIcon = () => {
    if (step === 1) return <Phone className="w-8 h-8 text-white" />;
    if (step === 1.5) return <UserPlus className="w-8 h-8 text-white" />;
    return <Shield className="w-8 h-8 text-white" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <SEOHead title="Login / Register" description="Login or create your Dharani Herbbals account using OTP verification." url="/otp-login" />
      <Header />
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-md mx-auto">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-t-lg">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
                  {stepIcon()}
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800">{stepTitle()}</CardTitle>
                <p className="text-gray-600 mt-2">{stepSubtitle()}</p>
              </div>
            </CardHeader>

            <CardContent className="p-8 md:p-10">

              {/* ── Step 1: Phone ── */}
              {step === 1 && (
                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                      {isTamil ? 'ஃபோன் எண்' : 'Phone Number'}
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required
                        placeholder={isTamil ? 'உங்கள் ஃபோன் எண்ணை உள்ளிடவும்' : 'Enter your phone number'}
                        className="pl-12 h-12 border-gray-200 focus:border-green-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {isTamil ? '10 இலக்கங்கள் மட்டும் (எ.கா: 9876543210)' : 'Enter 10 digits only, without +91 (e.g. 9876543210)'}
                    </p>
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg text-lg font-semibold">
                    {isLoading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />{isTamil ? 'சரிபார்க்கிறது...' : 'Checking...'}</> : (isTamil ? 'தொடரவும்' : 'Continue')}
                  </Button>
                  <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full border border-gray-300 transition-colors">
                    🔑 {isTamil ? 'கடவுச்சொல்லுடன் உள்நுழைக' : 'Login with Password'}
                  </Link>
                </form>
              )}

              {/* ── Step 1.5: New user details ── */}
              {step === 1.5 && (
                <form onSubmit={handleNewUserSubmit} className="space-y-5">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                    {isTamil ? `${phone} எண்ணுடன் கணக்கு இல்லை. புதிய கணக்கு உருவாக்க விவரங்களை நிரப்பவும்.` : `No account found for ${phone}. Fill in your details to create one.`}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">{isTamil ? 'முழு பெயர்' : 'Full Name'}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input type="text" value={name} onChange={e => setName(e.target.value)} required
                        placeholder={isTamil ? 'உங்கள் பெயரை உள்ளிடவும்' : 'Enter your full name'}
                        className="pl-12 h-12 border-gray-200 focus:border-green-500" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">{isTamil ? 'மின்னஞ்சல்' : 'Email Address'}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                        placeholder={isTamil ? 'உங்கள் மின்னஞ்சலை உள்ளிடவும்' : 'Enter your email address'}
                        className="pl-12 h-12 border-gray-200 focus:border-green-500" />
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg text-lg font-semibold">
                    {isLoading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />{isTamil ? 'கணக்கு உருவாக்குகிறது...' : 'Creating Account...'}</> : (isTamil ? 'OTP பெறவும்' : 'Get OTP')}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => { setStep(1); setName(''); setEmail(''); }} className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />{isTamil ? 'திரும்பு' : 'Back'}
                  </Button>
                </form>
              )}

              {/* ── Step 2: OTP ── */}
              {step === 2 && (
                <form onSubmit={handleOTPSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="otp" className="text-sm font-medium text-gray-700 mb-2 block">
                      {isTamil ? 'OTP ஐ உள்ளிடவும்' : 'Enter OTP'}
                    </Label>
                    <Input id="otp" type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required placeholder={isTamil ? '6 இலக்க OTP' : 'Enter 6-digit OTP'}
                      className="h-12 border-gray-200 focus:border-green-500 text-center text-lg tracking-widest font-mono" maxLength={6} />
                    <p className="text-sm text-gray-500 mt-2">{isTamil ? 'OTP அனுப்பப்பட்டது:' : 'OTP sent to'} {phone}</p>
                  </div>
                  <div className="text-center text-sm font-medium">
                    {otpTimer > 0
                      ? <span className="text-orange-600">{isTamil ? 'காலாவதி:' : 'Expires in:'} {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, '0')}</span>
                      : <span className="text-red-600">{isTamil ? 'OTP காலாவதி' : 'OTP Expired'}</span>}
                  </div>
                  <Button type="submit" disabled={isLoading || otp.length !== 6} className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg text-lg font-semibold">
                    {isLoading ? (isTamil ? 'சரிபார்க்கிறது...' : 'Verifying...') : (isTamil ? 'OTP சரிபார்க்கவும்' : 'Verify OTP')}
                  </Button>
                  <Button type="button" variant="outline" onClick={resendOTP} disabled={isLoading || resendTimer > 0} className="w-full">
                    {resendTimer > 0 ? `${isTamil ? 'மீண்டும் அனுப்பவும்' : 'Resend OTP'} (${resendTimer}s)` : (isTamil ? 'மீண்டும் அனுப்பவும்' : 'Resend OTP')}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => { setStep(isNewUser ? 1.5 : 1); setOtp(''); setOtpTimer(0); }} className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />{isTamil ? 'திரும்பு' : 'Back'}
                  </Button>
                </form>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  {isTamil ? 'பதிவு செய்ய விரும்புகிறீர்களா?' : 'Want to register with password?'}{' '}
                  <Link to="/register" className="text-green-600 font-semibold hover:text-green-700">{isTamil ? 'இங்கே பதிவு செய்யவும்' : 'Register here'}</Link>
                </p>
              </div>

              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-700 text-center">
                  🔒 {isTamil ? 'OTP 30 நிமிடங்களுக்கு செல்லுபடியாகும்' : 'OTP is valid for 30 minutes for your security'}
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
