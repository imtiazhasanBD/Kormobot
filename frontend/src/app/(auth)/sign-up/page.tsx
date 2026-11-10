'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n/i18n-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { registerSchema, verifyOtpSchema } from '@/lib/validations/auth.schema';
import { Bot, Mail, Lock, User, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';

export default function SignUpPage() {
  const { t, locale } = useI18n();
  const router = useRouter();

  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first OTP box automatically when entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  const otpCode = otpDigits.join('');

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
        setOtpDigits(['', '', '', '', '', '']);
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
    onError: (err: any) => {
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
    onError: (err: any) => {
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
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setInfoMsg(
        locale === 'bn'
          ? 'নতুন একটি ওটিপি আপনার ইমেইলে পাঠানো হয়েছে।'
          : 'A new code has been sent to your email.',
      );
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to resend OTP.';
      setErrorMsg(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    // Zod Validation for Registration
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

    // Zod Validation for OTP
    const validation = verifyOtpSchema.safeParse({ email, otp: otpCode });
    if (!validation.success) {
      const issue = validation.error.issues?.[0];
      setErrorMsg(issue?.message || 'Please enter all 6 digits of the OTP.');
      return;
    }

    verifyOtpMutation.mutate();
  };

  // Handle individual box change
  const handleDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (cleanVal.length > 1) {
      // User pasted or typed multiple digits
      const pastedChars = cleanVal.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedChars[i] || '';
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pastedChars.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    // Auto-advance to next box if character was entered
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace navigation
  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Paste across boxes
  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    const chars = pastedData.split('');
    chars.forEach((char, i) => {
      if (i < 6) newDigits[i] = char;
    });
    setOtpDigits(newDigits);

    const targetIndex = Math.min(chars.length, 5);
    inputRefs.current[targetIndex]?.focus();
  };

  const handleGoogleLogin = () => {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#f8f9fd] relative">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-[440px] space-y-6 bg-white border border-[#e2e5f1] p-8 rounded-md shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        {/* Brand Header */}
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary font-bold text-lg"
          >
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-[#0f172a] font-extrabold tracking-tight">
              Kormobot AI
            </span>
          </Link>
          <div className="pt-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">
              {step === 'otp'
                ? locale === 'bn'
                  ? 'ইমেইল যাচাই করুন'
                  : 'Verify your email'
                : locale === 'bn'
                  ? 'নতুন অ্যাকাউন্ট তৈরি করুন'
                  : 'Create an account'}
            </h2>
            <p className="text-sm text-[#64748b] mt-1 font-normal">
              {step === 'otp'
                ? locale === 'bn'
                  ? `${email} ঠিকানায় পাঠানো ৬ সংখ্যার কোড লিখুন`
                  : `Enter the 6-digit confirmation code sent to ${email}`
                : locale === 'bn'
                  ? 'শুরু করতে আপনার তথ্য পূরণ করুন'
                  : 'Sign up to start auto-applying to jobs with AI'}
            </p>
          </div>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="p-3 rounded-md bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-xs font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#ef4444]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="p-3 rounded-md bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] text-xs font-medium flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#22c55e]" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Step 1: Registration Form */}
        {step === 'register' && (
          <>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                  {locale === 'bn' ? 'পুরো নাম' : 'FULL NAME'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#94a3b8] absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-9 pr-3 py-2.5 rounded-md border border-[#cbd5e1] bg-white text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                  {locale === 'bn' ? 'ইমেইল ঠিকানা' : 'EMAIL ADDRESS'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#94a3b8] absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-md border border-[#cbd5e1] bg-white text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                  {locale === 'bn'
                    ? 'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)'
                    : 'PASSWORD (MIN. 6 CHARACTERS)'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94a3b8] absolute left-3 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 rounded-md border border-[#cbd5e1] bg-white text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-[#94a3b8] hover:text-[#475569] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full py-2.5 rounded-md bg-primary text-white font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-1 cursor-pointer"
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
              </button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#e2e8f0]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                <span className="bg-white px-2.5 text-[#94a3b8]">
                  {locale === 'bn' ? 'অথবা' : 'OR CONTINUE WITH'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2.5 rounded-md border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] font-medium text-sm text-[#334155] flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
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
            </button>
          </>
        )}

        {/* Step 2: 6-Box OTP Verification Form */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-3 text-center">
                {locale === 'bn' ? '৬-সংখ্যার কোড প্রবেশ করুন' : 'ENTER 6-DIGIT CODE'}
              </label>

              {/* 6 Individual Digit Boxes */}
              <div className="flex items-center justify-between gap-2 sm:gap-2.5">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(index, e)}
                    onPaste={handleDigitPaste}
                    className="w-12 h-14 sm:w-13 sm:h-14 text-center text-xl sm:text-2xl font-extrabold text-[#0f172a] bg-white border border-[#cbd5e1] rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs transition-all"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={verifyOtpMutation.isPending || otpCode.length !== 6}
              className="w-full py-2.5 rounded-md bg-primary text-white font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer shadow-sm shadow-primary/20"
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
            </button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep('register')}
                className="text-[#64748b] hover:text-[#0f172a] underline font-medium"
              >
                {locale === 'bn' ? '← ফেরত যান' : '← Change details'}
              </button>

              <button
                type="button"
                onClick={() => resendOtpMutation.mutate()}
                disabled={resendOtpMutation.isPending}
                className="text-primary font-bold hover:underline"
              >
                {resendOtpMutation.isPending
                  ? t.common.loading
                  : locale === 'bn'
                    ? 'পুনরায় পাঠান'
                    : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-xs text-[#64748b] mt-5">
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
      </div>
    </div>
  );
}
