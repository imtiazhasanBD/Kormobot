'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n/i18n-context';
import { forgotPasswordSchema, resetPasswordSchema } from '@/lib/validations/auth.schema';
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import {
  AuthSplitShell,
  authInputCls,
  authLabelCls,
} from '@/components/auth/auth-split-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function ForgotPasswordPage() {
  const { locale } = useI18n();
  const router = useRouter();
  const bn = locale === 'bn';

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
        bn
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
        bn
          ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে! লগইন পৃষ্ঠায় নিয়ে যাওয়া হচ্ছে...'
          : 'Password reset successful! Redirecting to sign in...',
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
      setErrorMsg(bn ? 'নতুন পাসওয়ার্ড দুটি মিলছে না।' : 'Passwords do not match.');
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

  const title =
    step === 'request'
      ? bn
        ? 'পাসওয়ার্ড ভুলে গেছেন?'
        : 'Forgot Password?'
      : bn
        ? 'নতুন পাসওয়ার্ড সেট করুন'
        : 'Reset Your Password';

  const subtitle =
    step === 'request'
      ? bn
        ? 'আপনার অ্যাকাউন্টের ইমেইল লিখুন, আমরা একটি ওটিপি কোড পাঠাব'
        : 'Enter your registered email and we will send a 6-digit reset code'
      : bn
        ? `${email} ঠিকানায় পাঠানো কোড এবং নতুন পাসওয়ার্ড লিখুন`
        : `Enter the 6-digit code sent to ${email} and your new password`;

  return (
    <AuthSplitShell
      variant="forgot-password"
      title={title}
      subtitle={subtitle}
      errorMsg={errorMsg}
      infoMsg={infoMsg}
    >
      {/* Step 1: Request Reset Code */}
      {step === 'request' && (
        <form onSubmit={handleRequestSubmit} className="mt-9">
          <Label htmlFor="reset-email" className={authLabelCls}>
            {bn ? 'ইমেইল ঠিকানা' : 'Email Address'}
          </Label>
          <div className="relative mt-[6px]">
            <Mail className="w-[18px] h-[18px] text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.6]" />
            <Input
              id="reset-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={bn ? 'আপনার ইমেইল লিখুন' : 'Enter your email'}
              className={`${authInputCls} pl-11 pr-4`}
            />
          </div>

          <Button
            type="submit"
            disabled={forgotPasswordMutation.isPending}
            className="w-full h-[46px] mt-7 rounded-md font-semibold text-[15px] gap-2 shadow-none cursor-pointer"
          >
            {forgotPasswordMutation.isPending && (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
            <span>
              {forgotPasswordMutation.isPending
                ? bn
                  ? 'পাঠানো হচ্ছে...'
                  : 'Sending Code...'
                : bn
                  ? 'রিসেট কোড পাঠান'
                  : 'Send Reset Code'}
            </span>
          </Button>
        </form>
      )}

      {/* Step 2: 6-Box OTP + New Password */}
      {step === 'reset' && (
        <form onSubmit={handleResetSubmit} className="mt-7">
          <div className="space-y-2.5">
            <Label className={`${authLabelCls} block text-center`}>
              {bn ? '৬-সংখ্যার কোড' : '6-digit reset code'}
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
                      className="w-11 h-12 sm:w-12 sm:h-13 text-lg font-extrabold rounded-md border border-input bg-card text-foreground shadow-none"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <Label htmlFor="new-password" className={`${authLabelCls} mt-5 flex`}>
            {bn ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'New Password (min. 6 characters)'}
          </Label>
          <div className="relative mt-[6px]">
            <Lock className="w-[18px] h-[18px] text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.6]" />
            <Input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={bn ? 'নতুন পাসওয়ার্ড লিখুন' : 'Enter new password'}
              className={`${authInputCls} pl-11 pr-11`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <Eye className="w-[18px] h-[18px] stroke-[1.6]" />
              ) : (
                <EyeOff className="w-[18px] h-[18px] stroke-[1.6]" />
              )}
            </Button>
          </div>

          <Label htmlFor="confirm-password" className={`${authLabelCls} mt-4 flex`}>
            {bn ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
          </Label>
          <div className="relative mt-[6px]">
            <Lock className="w-[18px] h-[18px] text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.6]" />
            <Input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={bn ? 'পুনরায় পাসওয়ার্ড লিখুন' : 'Confirm new password'}
              className={`${authInputCls} pl-11 pr-4`}
            />
          </div>

          <Button
            type="submit"
            disabled={resetPasswordMutation.isPending || otpCode.length !== 6}
            className="w-full h-[46px] mt-6 rounded-md font-semibold text-[15px] gap-2 shadow-none cursor-pointer"
          >
            {resetPasswordMutation.isPending && (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
            <span>
              {resetPasswordMutation.isPending
                ? bn
                  ? 'পরিবর্তন করা হচ্ছে...'
                  : 'Resetting Password...'
                : bn
                  ? 'পাসওয়ার্ড রিসেট করুন'
                  : 'Reset Password & Sign In'}
            </span>
          </Button>
        </form>
      )}

      <div className="flex justify-center mt-7">
        <Button
          variant="link"
          size="sm"
          nativeButton={false}
          render={<Link href="/sign-in" />}
          className="gap-1.5 text-sm text-muted-foreground hover:text-foreground font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{bn ? 'সাইন ইন পৃষ্ঠায় ফিরে যান' : 'Back to Sign In'}</span>
        </Button>
      </div>
    </AuthSplitShell>
  );
}
