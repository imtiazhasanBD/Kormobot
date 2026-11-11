'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n/i18n-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { registerSchema, verifyOtpSchema } from '@/lib/validations/auth.schema';
import { Bot, Mail, Lock, User, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function SignUpPage() {
  const { t, locale } = useI18n();
  const router = useRouter();

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
          locale === 'bn'
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
        (locale === 'bn' ? 'নিবন্ধন ব্যর্থ হয়েছে।' : 'Registration failed.');
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
        (locale === 'bn' ? 'ভুল বা মেয়াদোত্তীর্ণ ওটিপি।' : 'Invalid or expired OTP.');
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
        locale === 'bn'
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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-background relative">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-[440px] p-8 has-data-[slot=card-footer]:pb-8 gap-6 shadow-sm">
        <CardHeader className="p-0 space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary font-bold text-lg w-fit"
          >
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-foreground font-extrabold tracking-tight">
              Kormobot AI
            </span>
          </Link>
          <div className="pt-1 space-y-1">
            <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">
              {step === 'otp'
                ? locale === 'bn'
                  ? 'ইমেইল যাচাই করুন'
                  : 'Verify your email'
                : locale === 'bn'
                  ? 'নতুন অ্যাকাউন্ট তৈরি করুন'
                  : 'Create an account'}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground font-normal">
              {step === 'otp'
                ? locale === 'bn'
                  ? `${email} ঠিকানায় পাঠানো ৬ সংখ্যার কোড লিখুন`
                  : `Enter the 6-digit confirmation code sent to ${email}`
                : locale === 'bn'
                  ? 'শুরু করতে আপনার তথ্য পূরণ করুন'
                  : 'Sign up to start auto-applying to jobs with AI'}
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

          {/* Step 1: Registration Form */}
          {step === 'register' && (
            <>
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="fullName"
                    className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider"
                  >
                    {locale === 'bn' ? 'পুরো নাম' : 'FULL NAME'}
                  </Label>
                  <div className="relative">
                    <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="h-10 pl-9 bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider"
                  >
                    {locale === 'bn' ? 'ইমেইল ঠিকানা' : 'EMAIL ADDRESS'}
                  </Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="h-10 pl-9 bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider"
                  >
                    {locale === 'bn'
                      ? 'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)'
                      : 'PASSWORD (MIN. 6 CHARACTERS)'}
                  </Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full h-10 font-semibold text-sm gap-2 mt-1 cursor-pointer"
                >
                  {registerMutation.isPending && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  <span>
                    {registerMutation.isPending
                      ? t.common.loading
                      : locale === 'bn'
                        ? 'অ্যাকাউন্ট তৈরি করুন'
                        : 'Create Account'}
                  </span>
                </Button>
              </form>

              <div className="relative my-5 flex items-center">
                <Separator className="flex-1" />
                <span className="px-2.5 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  {locale === 'bn' ? 'অথবা' : 'OR CONTINUE WITH'}
                </span>
                <Separator className="flex-1" />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full h-10 font-medium text-sm gap-2.5 bg-background cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {locale === 'bn' ? 'গুগল দিয়ে সাইন আপ করুন' : 'Sign up with Google'}
                </span>
              </Button>
            </>
          )}

          {/* Step 2: 6-Box OTP Verification Form */}
          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div className="space-y-3">
                <Label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                  {locale === 'bn' ? '৬-সংখ্যার কোড প্রবেশ করুন' : 'ENTER 6-DIGIT CODE'}
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
                          className="w-11 h-13 sm:w-12 sm:h-14 text-xl font-extrabold rounded-md border border-input bg-background shadow-xs"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button
                type="submit"
                disabled={verifyOtpMutation.isPending || otpCode.length !== 6}
                className="w-full h-10 font-semibold text-sm gap-2 cursor-pointer shadow-sm shadow-primary/20"
              >
                {verifyOtpMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                <span>
                  {verifyOtpMutation.isPending
                    ? t.common.loading
                    : locale === 'bn'
                      ? 'কোড যাচাই করুন'
                      : 'Verify Code & Continue'}
                </span>
              </Button>

              <div className="flex items-center justify-between text-xs pt-1">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setStep('register')}
                  className="px-0 text-muted-foreground hover:text-foreground font-medium"
                >
                  {locale === 'bn' ? '← ফেরত যান' : '← Change details'}
                </Button>

                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => resendOtpMutation.mutate()}
                  disabled={resendOtpMutation.isPending}
                  className="px-0 text-primary font-bold"
                >
                  {resendOtpMutation.isPending
                    ? t.common.loading
                    : locale === 'bn'
                      ? 'পুনরায় পাঠান'
                      : 'Resend Code'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="p-0 border-t-0 bg-transparent justify-center">
          <p className="text-center text-xs text-muted-foreground">
            {locale === 'bn'
              ? 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে?'
              : 'Already have an account?'}{' '}
            <Link
              href="/sign-in"
              className="text-primary font-bold hover:underline ml-0.5"
            >
              {locale === 'bn' ? 'লগইন করুন' : 'Sign in'}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
