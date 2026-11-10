'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n/i18n-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { forgotPasswordSchema, resetPasswordSchema } from '@/lib/validations/auth.schema';
import { Bot, Mail, Lock, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { locale } = useI18n();
  const router = useRouter();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 'reset') {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  const otpCode = otpDigits.join('');

  // 1. Request Reset OTP
  const forgotPasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/forgot-password', { email });
      return res.data;
    },
    onSuccess: (data) => {
      setStep('reset');
      setOtpDigits(['', '', '', '', '', '']);
      setInfoMsg(
        locale === 'bn'
          ? 'পাসওয়ার্ড রিসেট করার ৬-সংখ্যার কোড আপনার ইমেইলে পাঠানো হয়েছে।'
          : data?.message || 'A 6-digit reset code has been sent to your email.',
      );
    },
    onError: (err: any) => {
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
    onError: (err: any) => {
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

  // 6-box OTP handlers
  const handleDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (cleanVal.length > 1) {
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

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#f8f9fd] relative">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-[430px] space-y-6 bg-white border border-[#e2e5f1] p-8 rounded-md shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        {/* Brand Header */}
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary font-bold text-lg"
          >
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-[#0f172a] font-extrabold tracking-tight">Kormobot AI</span>
          </Link>

          <div className="pt-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">
              {step === 'request'
                ? locale === 'bn'
                  ? 'পাসওয়ার্ড ভুলে গেছেন?'
                  : 'Forgot password?'
                : locale === 'bn'
                  ? 'নতুন পাসওয়ার্ড সেট করুন'
                  : 'Reset your password'}
            </h2>
            <p className="text-sm text-[#64748b] mt-1 font-normal">
              {step === 'request'
                ? locale === 'bn'
                  ? 'আপনার অ্যাকাউন্টের ইমেইল লিখুন, আমরা একটি ওটিপি কোড পাঠাব'
                  : 'Enter your registered email and we will send a 6-digit code'
                : locale === 'bn'
                  ? `${email} ঠিকানায় পাঠানো কোড এবং নতুন পাসওয়ার্ড লিখুন`
                  : `Enter the 6-digit code sent to ${email} and your new password`}
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

        {/* Step 1: Request Reset Code */}
        {step === 'request' && (
          <form onSubmit={handleRequestSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={forgotPasswordMutation.isPending}
              className="w-full py-2.5 rounded-md bg-primary text-white font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-1 cursor-pointer"
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
            </button>
          </form>
        )}

        {/* Step 2: 6-Box OTP + New Password */}
        {step === 'reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-2 text-center">
                {locale === 'bn' ? '৬-সংখ্যার কোড' : '6-DIGIT RESET CODE'}
              </label>
              <div className="flex items-center justify-between gap-1.5 sm:gap-2">
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
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-extrabold text-[#0f172a] bg-white border border-[#cbd5e1] rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-xs transition-all"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                {locale === 'bn' ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'NEW PASSWORD (MIN. 6 CHARACTERS)'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94a3b8] absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1.5">
                {locale === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'CONFIRM PASSWORD'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94a3b8] absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-md border border-[#cbd5e1] bg-white text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={resetPasswordMutation.isPending || otpCode.length !== 6}
              className="w-full py-2.5 rounded-md bg-primary text-white font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-1 cursor-pointer"
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
            </button>
          </form>
        )}

        <div className="pt-2 text-center">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748b] hover:text-[#0f172a] font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{locale === 'bn' ? 'লগইন পৃষ্ঠায় ফিরে যান' : 'Back to Sign In'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

