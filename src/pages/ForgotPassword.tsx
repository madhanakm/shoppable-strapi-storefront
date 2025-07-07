import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetOTP, verifyPasswordResetOTP, resetPassword } from '@/services/password-reset';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await sendPasswordResetOTP(phone);
      if (success) {
        setStep(2);
        toast({ title: "OTP Sent", description: "Check your mobile for verification code" });
      } else {
        toast({ title: "Error", description: "Phone number not found", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send OTP", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const valid = await verifyPasswordResetOTP(phone, otp);
      if (valid) {
        setStep(3);
        toast({ title: "OTP Verified", description: "Enter your new password" });
      } else {
        toast({ title: "Error", description: "Invalid or expired OTP", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "OTP verification failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const success = await resetPassword(phone, newPassword);
      if (success) {
        toast({ title: "Success", description: "Password reset successfully" });
        navigate('/login');
      } else {
        toast({ title: "Error", description: "Failed to reset password", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Password reset failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {step === 1 && 'Reset Password'}
                {step === 2 && 'Verify OTP'}
                {step === 3 && 'New Password'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send OTP'}
                  </Button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Enter OTP sent to {phone}
                    </p>
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center">
                <Link to="/login" className="text-primary hover:underline">
                  Back to Login
                </Link>
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