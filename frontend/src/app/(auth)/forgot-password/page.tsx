'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n/i18n-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { forgotPasswordSchema, resetPasswordSchema } from '@/lib/validations/auth.schema';
import { Bot, Mail, Lock, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function ForgotPasswordPage() {
  const { locale } = useI18n();
  const router = useRouter();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // 1. Request Reset OTP
  const forgotPasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/forgot-password', { email });
      return res.data;
    },
    onSuccess: (data) => {
      setStep('reset');
      setOtpCode('');
      setInfoMsg(
        locale === 'bn'
          ? 'পাসওয়ার্ড রিসেট করার ৬-সংখ্যার কোড আপনার ইমেইলে পাঠানো হয়েছে।'
          : data?.message || 'A 6-digit reset code has been sent to your email.',
      );
    },
    onError: (err: AxiosError<{ message?: string | string[] }>) => {
      const msg = err?.response?.data?.message || 'Failed to send reset code.';
      setErrorMsg(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  // 2. Submit Reset with OTP and New Password
  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/reset-password', {
        email,
        otp: otpCode,
        newPassword,
      });
      return res.data;
    },
    onSuccess: () => {
      setInfoMsg(
        locale === 'bn'
          ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে! লগইন পৃষ্ঠায় নিয়ে যাওয়া হচ্ছে...'
          : 'Password reset successful! Redirecting to login...',
      );
      setTimeout(() => {
        router.push('/sign-in');
      }, 1500);
    },
    onError: (err: AxiosError<{ message?: string | string[] }>) => {
      const msg = err?.response?.data?.message || 'Invalid or expired reset code.';
      setErrorMsg(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setErrorMsg(validation.error.issues?.[0]?.message || 'Please enter a valid email.');
      return;
    }

    forgotPasswordMutation.mutate();
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg(
        locale === 'bn'
          ? 'নতুন পাসওয়ার্ড দুটি মিলছে না।'
          : 'Passwords do not match.',
      );
      return;
    }

    const validation = resetPasswordSchema.safeParse({
      email,
      otp: otpCode,
      newPassword,
    });

    if (!validation.success) {
      setErrorMsg(
        validation.error.issues?.[0]?.message ||
          'Please enter a valid 6-digit code and password (min 6 characters).',
      );
      return;
    }

    resetPasswordMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-background relative">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-[430px] p-8 has-data-[slot=card-footer]:pb-8 gap-6 shadow-sm">
        <CardHeader className="p-0 space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary font-bold text-lg w-fit"
          >
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-foreground font-extrabold tracking-tight">Kormobot AI</span>
          </Link>

          <div className="pt-1 space-y-1">
            <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">
              {step === 'request'
                ? locale === 'bn'
                  ? 'পাসওয়ার্ড ভুলে গেছেন?'
                  : 'Forgot password?'
                : locale === 'bn'
                  ? 'নতুন পাসওয়ার্ড সেট করুন'
                  : 'Reset your password'}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground font-normal">
              {step === 'request'
                ? locale === 'bn'
                  ? 'আপনার অ্যাকাউন্টের ইমেইল লিখুন, আমরা একটি ওটিপি কোড পাঠাব'
                  : 'Enter your registered email and we will send a 6-digit code'
                : locale === 'bn'
                  ? `${email} ঠিকানায় পাঠানো কোড এবং নতুন পাসওয়ার্ড লিখুন`
                  : `Enter the 6-digit code sent to ${email} and your new password`}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0 space-y-5">
          {errorMsg && (
            <Alert variant="destructive" className="bg-destructive/5 border-destructive/25">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-xs font-medium">{errorMsg}</AlertDescription>
            </Alert>
          )}

          {infoMsg && (
            <Alert className="bg-success-muted border-success-border text-success-muted-foreground [&>svg]:text-success">
              <CheckCircle2 className="w-4 h-4" />
              <AlertDescription className="text-xs font-medium text-success-muted-foreground">
                {infoMsg}
              </AlertDescription>
            </Alert>
          )}

          {/* Step 1: Request Reset Code */}
          {step === 'request' && (
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="reset-email"
                  className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider"
                >
                  {locale === 'bn' ? 'ইমেইল ঠিকানা' : 'EMAIL ADDRESS'}
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
                  <Input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="h-10 pl-9 bg-background"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="w-full h-10 font-semibold text-sm gap-2 mt-1 cursor-pointer"
              >
                {forgotPasswordMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                <span>
                  {forgotPasswordMutation.isPending
                    ? locale === 'bn'
                      ? 'পাঠানো হচ্ছে...'
                      : 'Sending Code...'
                    : locale === 'bn'
                      ? 'রিসেট কোড পাঠান'
                      : 'Send Reset Code'}
                </span>
              </Button>
            </form>
          )}

          {/* Step 2: 6-Box OTP + New Password */}
          {step === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                  {locale === 'bn' ? '৬-সংখ্যার কোড' : '6-DIGIT RESET CODE'}
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    autoFocus
                    inputMode="numeric"
                    value={otpCode}
                    onChange={(value) => setOtpCode(value.replace(/\D/g, ''))}
                  >
                    <InputOTPGroup className="gap-1.5 sm:gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="w-11 h-13 sm:w-12 sm:h-14 text-xl font-extrabold rounded-md border border-input bg-background shadow-xs"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="new-password"
                  className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider"
                >
                  {locale === 'bn'
                    ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)'
                    : 'NEW PASSWORD (MIN. 6 CHARACTERS)'}
                </Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 pl-9 pr-10 bg-background"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="confirm-password"
                  className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider"
                >
                  {locale === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'CONFIRM PASSWORD'}
                </Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 pl-9 bg-background"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={resetPasswordMutation.isPending || otpCode.length !== 6}
                className="w-full h-10 font-semibold text-sm gap-2 mt-1 cursor-pointer"
              >
                {resetPasswordMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                <span>
                  {resetPasswordMutation.isPending
                    ? locale === 'bn'
                      ? 'পরিবর্তন করা হচ্ছে...'
                      : 'Resetting Password...'
                    : locale === 'bn'
                      ? 'পাসওয়ার্ড রিসেট করুন'
                      : 'Reset Password & Log In'}
                </span>
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="p-0 border-t-0 bg-transparent justify-center pt-1">
          <Button
            variant="link"
            size="sm"
            nativeButton={false}
            render={<Link href="/sign-in" />}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{locale === 'bn' ? 'লগইন পৃষ্ঠায় ফিরে যান' : 'Back to Sign In'}</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
