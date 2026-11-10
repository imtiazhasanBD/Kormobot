'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n/i18n-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Bot, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function SignInPage() {
  const { t, locale } = useI18n();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/login', { email, password });
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
        (locale === 'bn'
          ? 'লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।'
          : 'Invalid email or password.');
      setErrorMsg(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    loginMutation.mutate();
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
              {locale === 'bn' ? 'স্বাগতম' : 'Welcome back'}
            </h2>
            <p className="text-sm text-[#64748b] mt-1 font-normal">
              {locale === 'bn'
                ? 'ড্যাশবোর্ড অ্যাক্সেস করতে আপনার তথ্য লিখুন'
                : 'Enter your credentials to access your dashboard'}
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="p-3 rounded-md bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-xs font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#ef4444]" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              {locale === 'bn' ? 'পাসওয়ার্ড' : 'PASSWORD'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94a3b8] absolute left-3 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
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
            disabled={loginMutation.isPending}
            className="w-full py-2.5 rounded-md bg-primary text-white font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-1 cursor-pointer"
          >
            {loginMutation.isPending && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            <span>
              {loginMutation.isPending
                ? t.common.loading
                : locale === 'bn'
                  ? 'লগইন করুন'
                  : 'Sign In'}
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
            {locale === 'bn' ? 'গুগল দিয়ে লগইন করুন' : 'Sign in with Google'}
          </span>
        </button>

        <p className="text-center text-xs text-[#64748b] mt-5">
          {locale === 'bn'
            ? 'কোনো অ্যাকাউন্ট নেই?'
            : "Don't have an account?"}{' '}
          <Link
            href="/sign-up"
            className="text-primary font-bold hover:underline ml-0.5"
          >
            {locale === 'bn' ? 'নিবন্ধন করুন' : 'Sign up'}
          </Link>
        </p>
      </div>
    </div>
  );
}
