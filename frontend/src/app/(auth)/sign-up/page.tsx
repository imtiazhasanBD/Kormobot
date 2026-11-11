'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n/i18n-context';
import { registerSchema, verifyOtpSchema } from '@/lib/validations/auth.schema';
import { Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import {
  AuthSplitShell,
  authInputCls,
  authLabelCls,
  GoogleLogo,
  GithubLogo,
} from '@/components/auth/auth-split-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function SignUpPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const bn = locale === 'bn';

  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // 1. Register Mutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/register', {
        fullName,
        email,
        password,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data?.requiresOtp) {
        setStep('otp');
        setOtpCode('');
        setInfoMsg(
          bn
            ? 'আপনার ইমেইলে একটি ৬-সংখ্যার যাচাইকরণ কোড পাঠানো হয়েছে।'
            : 'A 6-digit confirmation code has been sent to your email.',
        );
      } else if (data?.accessToken) {
        localStorage.setItem('kormobot_token', data.accessToken);
        document.cookie = `kormobot_token=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
        router.push('/dashboard');
      }
    },
    onError: (err: AxiosError<{ message?: string | string[] }>) => {
      const msg =
        err?.response?.data?.message ||
        (bn ? 'নিবন্ধন ব্যর্থ হয়েছে।' : 'Registration failed.');
      setErrorMsg(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  // 2. OTP Verification Mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/verify-otp', {
        email,
        otp: otpCode,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data?.accessToken) {
        localStorage.setItem('kormobot_token', data.accessToken);
        document.cookie = `kormobot_token=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
      }
      router.push('/dashboard');
    },
    onError: (err: AxiosError<{ message?: string | string[] }>) => {
      const msg =
        err?.response?.data?.message ||
        (bn ? 'ভুল বা মেয়াদোত্তীর্ণ ওটিপি।' : 'Invalid or expired OTP.');
      setErrorMsg(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  // 3. Resend OTP Mutation
  const resendOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/resend-otp', { email });
      return res.data;
    },
    onSuccess: () => {
      setErrorMsg('');
      setOtpCode('');
      setInfoMsg(
        bn
          ? 'নতুন একটি ওটিপি আপনার ইমেইলে পাঠানো হয়েছে।'
          : 'A new code has been sent to your email.',
      );
    },
    onError: (err: AxiosError<{ message?: string | string[] }>) => {
      const msg = err?.response?.data?.message || 'Failed to resend OTP.';
      setErrorMsg(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const validation = registerSchema.safeParse({ fullName, email, password });
    if (!validation.success) {
      const issue = validation.error.issues?.[0];
      setErrorMsg(issue?.message || 'Please check your inputs.');
      return;
    }

    registerMutation.mutate();
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const validation = verifyOtpSchema.safeParse({ email, otp: otpCode });
    if (!validation.success) {
      const issue = validation.error.issues?.[0];
      setErrorMsg(issue?.message || 'Please enter all 6 digits of the OTP.');
      return;
    }

    verifyOtpMutation.mutate();
  };

  const handleGoogleLogin = () => {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    window.location.assign(`${backendUrl}/auth/google`);
  };

  const handleGithubLogin = () => {
    setErrorMsg(
      bn
        ? 'গিটহাব সাইন আপ এখনো কনফিগার করা হয়নি। অনুগ্রহ করে গুগল বা ইমেইল ব্যবহার করুন।'
        : 'GitHub OAuth is not configured yet. Please sign up with Google or email.',
    );
  };

  const title =
    step === 'otp'
      ? bn
        ? 'ইমেইল যাচাই করুন'
        : 'Verify Your Email'
      : bn
        ? 'অ্যাকাউন্ট তৈরি করুন'
        : 'Create Account';

  const subtitle =
    step === 'otp'
      ? bn
        ? `${email} ঠিকানায় পাঠানো ৬ সংখ্যার কোড লিখুন`
        : `Enter the 6-digit confirmation code sent to ${email}`
      : bn
        ? 'আপনার কর্মবট এআই অ্যাকাউন্ট তৈরি করুন'
        : 'Sign up for your Kormobot AI account';

  return (
    <AuthSplitShell
      title={title}
      subtitle={subtitle}
      errorMsg={errorMsg}
      infoMsg={infoMsg}
    >
      {step === 'register' && (
        <>
          <form onSubmit={handleRegisterSubmit} className="mt-7">
            {/* Full Name */}
            <Label htmlFor="fullName" className={authLabelCls}>
              {bn ? 'পুরো নাম' : 'Full Name'}
            </Label>
            <div className="relative mt-[6px]">
              <User className="w-[18px] h-[18px] text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.6]" />
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={bn ? 'আপনার পুরো নাম লিখুন' : 'Enter your full name'}
                className={`${authInputCls} pl-11 pr-4`}
              />
            </div>

            {/* Email */}
            <Label htmlFor="email" className={`${authLabelCls} mt-4 flex`}>
              {bn ? 'ইমেইল ঠিকানা' : 'Email Address'}
            </Label>
            <div className="relative mt-[6px]">
              <Mail className="w-[18px] h-[18px] text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.6]" />
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={bn ? 'আপনার ইমেইল লিখুন' : 'Enter your email'}
                className={`${authInputCls} pl-11 pr-4`}
              />
            </div>

            {/* Password */}
            <Label htmlFor="password" className={`${authLabelCls} mt-4 flex`}>
              {bn ? 'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'Password (min. 6 characters)'}
            </Label>
            <div className="relative mt-[6px]">
              <Lock className="w-[18px] h-[18px] text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.6]" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={bn ? 'পাসওয়ার্ড তৈরি করুন' : 'Create a password'}
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

            {/* Submit */}
            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full h-[46px] mt-6 rounded-md font-semibold text-[15px] gap-2 shadow-none cursor-pointer"
            >
              {registerMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>
                {registerMutation.isPending
                  ? t.common.loading
                  : bn
                    ? 'অ্যাকাউন্ট তৈরি করুন'
                    : 'Sign Up'}
              </span>
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center mt-6">
            <Separator className="flex-1" />
            <span className="px-[16px] text-xs sm:text-sm leading-5 text-muted-foreground">
              {bn ? 'অথবা চালিয়ে যান' : 'Or continue with'}
            </span>
            <Separator className="flex-1" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-[16px] mt-5">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="h-[46px] rounded-md bg-card gap-2.5 font-semibold text-sm text-foreground cursor-pointer"
            >
              <GoogleLogo />
              <span>Google</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleGithubLogin}
              className="h-[46px] rounded-md bg-card gap-2.5 font-semibold text-sm text-foreground cursor-pointer"
            >
              <GithubLogo />
              <span>GitHub</span>
            </Button>
          </div>
        </>
      )}

      {/* Step 2: 6-Box OTP Verification Form */}
      {step === 'otp' && (
        <form onSubmit={handleOtpSubmit} className="mt-9 space-y-6">
          <div className="space-y-3">
            <Label className={`${authLabelCls} block text-center`}>
              {bn ? '৬-সংখ্যার কোড প্রবেশ করুন' : 'Enter 6-digit code'}
            </Label>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                autoFocus
                inputMode="numeric"
                value={otpCode}
                onChange={(value) => setOtpCode(value.replace(/\D/g, ''))}
              >
                <InputOTPGroup className="gap-2">
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

          <Button
            type="submit"
            disabled={verifyOtpMutation.isPending || otpCode.length !== 6}
            className="w-full h-[46px] rounded-md font-semibold text-[15px] gap-2 shadow-none cursor-pointer"
          >
            {verifyOtpMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>
              {verifyOtpMutation.isPending
                ? t.common.loading
                : bn
                  ? 'কোড যাচাই করুন'
                  : 'Verify Code & Continue'}
            </span>
          </Button>

          <div className="flex items-center justify-between text-sm">
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => setStep('register')}
              className="px-0 text-muted-foreground hover:text-foreground font-medium cursor-pointer"
            >
              {bn ? '← ফেরত যান' : '← Change details'}
            </Button>

            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => resendOtpMutation.mutate()}
              disabled={resendOtpMutation.isPending}
              className="px-0 text-primary font-semibold cursor-pointer"
            >
              {resendOtpMutation.isPending
                ? t.common.loading
                : bn
                  ? 'পুনরায় পাঠান'
                  : 'Resend Code'}
            </Button>
          </div>
        </form>
      )}

      <p className="text-center text-sm leading-5 text-muted-foreground mt-6">
        {bn ? 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
        <Link href="/sign-in" className="font-semibold text-primary hover:underline">
          {bn ? 'সাইন ইন' : 'Sign In'}
        </Link>
      </p>
    </AuthSplitShell>
  );
}
