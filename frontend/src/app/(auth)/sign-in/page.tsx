'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n/i18n-context';
import { loginSchema } from '@/lib/validations/auth.schema';
import {
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  EyeOff,
  Eye,
  Zap,
  Layers,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

/* ---------- design tokens (measured from the reference image) ---------- */
const PURPLE = '#5524d8';
const PURPLE_HOVER = '#4719b8';
const INK = '#110f2e';
const BORDER = '#d9dce6';

/* ---------- small decorative pieces ---------- */
function DotGrid({
  rows,
  cols,
  gapX,
  gapY,
  className = '',
}: {
  rows: number;
  cols: number;
  gapX: number;
  gapY: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        gridTemplateColumns: `repeat(${cols}, 4px)`,
        columnGap: gapX,
        rowGap: gapY,
      }}
      className={`grid pointer-events-none select-none ${className}`}
    >
      {Array.from({ length: rows * cols }).map((_, i) => (
        <span key={i} className="w-1 h-1 rounded-full bg-[#cfd2e6]" />
      ))}
    </div>
  );
}

function BrandIcon({ size }: { size: number }) {
  return (
    <div
      style={{ width: size, height: size, background: PURPLE }}
      className="rounded-[9px] flex items-center justify-center shrink-0"
    >
      <svg width={size * 0.66} height={size * 0.66} viewBox="0 0 24 24" fill="none">
        <line x1="12" y1="2.6" x2="12" y2="6.2" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="2.6" r="1.4" fill="white" />
        <rect x="4.5" y="6.5" width="15" height="12.5" rx="4.2" fill="white" />
        <circle cx="9.3" cy="12.8" r="1.55" fill={PURPLE} />
        <circle cx="14.7" cy="12.8" r="1.55" fill={PURPLE} />
        <path d="M2.4 10.8V15" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M21.6 10.8V15" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function Brand({ size, text }: { size: number; text: number }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3 shrink-0">
      <BrandIcon size={size} />
      <span
        style={{ fontSize: text, color: INK }}
        className="font-extrabold tracking-tight leading-none"
      >
        Kormobot <span style={{ color: PURPLE }}>AI</span>
      </span>
    </Link>
  );
}

function MiniBars({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="13" width="4" height="7" rx="1" fill="currentColor" />
      <rect x="10" y="9" width="4" height="11" rx="1" fill="currentColor" />
      <rect x="16" y="4" width="4" height="16" rx="1" fill="currentColor" />
    </svg>
  );
}

function Illustration() {
  return (
    <div className="relative w-[420px] max-w-full h-[260px] lg:-ml-[22px]">
      {/* blob */}
      <svg
        viewBox="0 0 390 245"
        className="absolute left-0 top-0 w-[390px] h-[245px]"
        aria-hidden="true"
      >
        <path
          fill="#ece8fb"
          d="M20 150 C0 110 40 100 90 90 C130 20 200 0 270 5 C340 10 392 60 385 130 C380 190 330 220 270 235 C200 245 120 235 80 215 C40 195 25 175 20 150 Z"
        />
      </svg>

      {/* spark lines */}
      <svg
        className="absolute left-[68px] top-[21px] w-[48px] h-[44px]"
        viewBox="0 0 48 44"
        fill="none"
        aria-hidden="true"
      >
        <line x1="1.5" y1="28" x2="21" y2="41" stroke={PURPLE} strokeWidth="2.6" strokeLinecap="round" />
        <line x1="19.5" y1="11.5" x2="22.5" y2="16" stroke={PURPLE} strokeWidth="2.6" strokeLinecap="round" />
        <line x1="38" y1="3" x2="43.5" y2="23" stroke={PURPLE} strokeWidth="2.6" strokeLinecap="round" />
      </svg>

      {/* browser window */}
      <div className="absolute left-[95px] top-[82px] w-[244px] h-[158px] rounded-[10px] border-2 border-[#2b2552] bg-white overflow-hidden">
        <div className="h-[26px] bg-[#6d3ee8] border-b-2 border-[#2b2552] flex items-center gap-[6px] pl-[14px]">
          <span className="w-2 h-2 rounded-full bg-white" />
          <span className="w-2 h-2 rounded-full bg-white" />
          <span className="w-2 h-2 rounded-full bg-white" />
        </div>

        {/* robot tile */}
        <div className="absolute left-[21px] top-[44px] w-[81px] h-[69px] rounded-[8px] bg-[#ebe7fb] flex items-center justify-center">
          <svg width="46" height="46" viewBox="0 0 48 48" fill="none">
            <line x1="24" y1="5" x2="24" y2="11" stroke={PURPLE} strokeWidth="3" strokeLinecap="round" />
            <circle cx="24" cy="4.5" r="2.2" fill={PURPLE} />
            <rect x="9" y="11.5" width="30" height="24" rx="8" fill="white" stroke={PURPLE} strokeWidth="3.4" />
            <circle cx="18.2" cy="23.5" r="2.7" fill={PURPLE} />
            <circle cx="29.8" cy="23.5" r="2.7" fill={PURPLE} />
            <path d="M4.5 20V28" stroke={PURPLE} strokeWidth="3.4" strokeLinecap="round" />
            <path d="M43.5 20V28" stroke={PURPLE} strokeWidth="3.4" strokeLinecap="round" />
          </svg>
        </div>
        <span className="absolute left-[29px] top-[126px] w-[66px] h-[5px] rounded-full bg-[#dcd7f3]" />

        {/* checklist */}
        {[0, 1, 2].map((r) => (
          <div
            key={r}
            style={{ top: 49 + r * 27 }}
            className="absolute left-[127px] flex items-center gap-[9px]"
          >
            <span className="w-[15px] h-[15px] rounded-full bg-[#4cc27f] flex items-center justify-center">
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2.5 6.2L5 8.6L9.5 3.6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="space-y-[3px]">
              <span className="block h-[3px] w-[55px] rounded-full bg-[#c4c9da]" />
              <span className="block h-[3px] w-[36px] rounded-full bg-[#dfe2ee]" />
            </span>
          </div>
        ))}
      </div>

      {/* chart card */}
      <div className="absolute left-[300px] top-[177px] w-[104px] h-[74px] rounded-[10px] border-2 border-[#2b2552] bg-white flex items-end justify-center gap-[7px] pb-[18px] z-10">
        <span className="w-[11px] h-[14px] rounded-[2px] bg-[#8b6bf2]" />
        <span className="w-[11px] h-[26px] rounded-[2px] bg-[#6d3ee8]" />
        <span className="w-[11px] h-[38px] rounded-[2px]" style={{ background: PURPLE }} />
      </div>
    </div>
  );
}

/* shared tailwind strings */
const inputCls =
  'h-[46px] rounded-[6px] border-[#d9dce6] bg-white text-sm md:text-sm text-[#110f2e] placeholder:text-[#8b90a0] shadow-none focus-visible:ring-1 focus-visible:ring-[#5524d8] focus-visible:border-[#5524d8]';
const labelCls = 'text-sm leading-5 font-semibold text-[#110f2e]';

export default function SignInPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const bn = locale === 'bn';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
        const maxAgeAttr = rememberMe ? '; max-age=604800' : '';
        document.cookie = `kormobot_token=${data.accessToken}; path=/${maxAgeAttr}; SameSite=Lax`;
      }
      router.push('/dashboard');
    },
    onError: (err: AxiosError<{ message?: string | string[] }>) => {
      const msg =
        err?.response?.data?.message ||
        (bn ? 'লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।' : 'Invalid email or password.');
      setErrorMsg(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const issue = validation.error.issues?.[0];
      setErrorMsg(issue?.message || 'Please check your inputs.');
      return;
    }
    loginMutation.mutate();
  };

  const handleGoogleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    window.location.assign(`${backendUrl}/auth/google`);
  };

  const handleGithubLogin = () => {
    setErrorMsg(
      bn
        ? 'গিটহাব লগইন এখনো কনফিগার করা হয়নি। অনুগ্রহ করে গুগল বা ইমেইল ব্যবহার করুন।'
        : 'GitHub OAuth is not configured yet. Please sign in with Google or email.',
    );
  };

  const navLinks = [
    { href: '/', label: bn ? 'হোম' : 'Home' },
    { href: '/#features', label: bn ? 'বৈশিষ্ট্য' : 'Features' },
    { href: '/#pricing', label: bn ? 'মূল্য' : 'Pricing' },
    { href: '/#docs', label: bn ? 'ডক্স' : 'Docs' },
    { href: '/#contact', label: bn ? 'যোগাযোগ' : 'Contact' },
  ];

  const features = [
    { icon: 'zap', label: bn ? 'স্বয়ংক্রিয় চাকরি আবেদন' : 'Autonomous Job Apply' },
    { icon: 'layers', label: bn ? 'এআই রিজিউম পার্সিং' : 'AI Resume Parsing' },
    { icon: 'chart', label: bn ? 'স্মার্ট জব ম্যাচিং' : 'Smart Job Matching' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f8fc] text-[#110f2e] overflow-x-hidden">
      {/* ================= Header (93px) ================= */}
      <header className="w-full h-[93px] bg-white border-b border-[#e9eaf2] sticky top-0 z-30">
        <div className="relative max-w-[1120px] h-full mx-auto px-4 xl:px-0 flex items-center justify-between">
          <Brand size={36} text={26} />

          <nav className="hidden lg:flex items-center gap-[43px] text-[17px] font-medium text-[#1c1a3a] absolute left-[392px]">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="hover:text-[#5524d8] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center h-11 min-w-[90px] px-4 rounded-[6px] border border-[#d1d5db] bg-white text-[17px] font-semibold text-[#110f2e] hover:bg-gray-50 transition-colors"
            >
              {bn ? 'সাইন ইন' : 'Sign In'}
            </Link>
            <Link
              href="/sign-up"
              style={{ background: PURPLE }}
              className="inline-flex items-center justify-center h-11 min-w-[97px] px-4 rounded-[6px] text-[17px] font-semibold text-white hover:!bg-[#4719b8] transition-colors"
            >
              {bn ? 'সাইন আপ' : 'Sign Up'}
            </Link>
          </div>
        </div>
      </header>

      {/* ================= Main ================= */}
      <main className="flex-1 relative overflow-hidden px-4 py-10 lg:pt-[126px] lg:pb-[137px]">
        {/* top-left concentric arcs */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute left-[-272px] top-[-292px] w-[464px] h-[464px] rounded-full border border-[#e8e8f2]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute left-[-216px] top-[-236px] w-[352px] h-[352px] rounded-full border border-[#e8e8f2]"
        />

        {/* bottom-left dots */}
        <DotGrid
          rows={5}
          cols={8}
          gapX={19}
          gapY={20}
          className="hidden lg:grid absolute left-[36px] bottom-[43px]"
        />

        {/* bottom-right arc + blob */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute right-[-226px] bottom-[-380px] w-[500px] h-[500px] rounded-full border border-[#e4e0f4]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute right-[-194px] bottom-[-328px] w-[396px] h-[396px] rounded-full bg-gradient-to-t from-[#bfaef5] to-[#e2dbfa]"
        />

        {/* ---------- Card ---------- */}
        <div className="relative z-10 w-full max-w-[1108px] mx-auto rounded-md bg-white border border-[#e3e5ef] shadow-[0_16px_44px_-12px_rgba(30,24,70,0.08)] overflow-hidden grid grid-cols-1 lg:grid-cols-[577fr_531fr] lg:min-h-[680px]">
          {/* ----- Left: form ----- */}
          <div className="bg-white px-6 py-10 lg:pl-[63px] lg:pr-[48px] lg:pt-[72px] lg:pb-[45px]">
            <div className="w-full max-w-[466px]">
              <div className="lg:pl-[18px]">
                <h1
                  style={{ color: INK }}
                  className="text-2xl lg:text-[30px] leading-tight font-extrabold tracking-[-0.02em]"
                >
                  {bn ? 'স্বাগতম' : 'Welcome Back'}
                </h1>
                <p className="text-sm lg:text-[15px] leading-6 text-[#4b5068] mt-2">
                  {bn
                    ? 'আপনার কর্মবট এআই অ্যাকাউন্টে সাইন ইন করুন'
                    : 'Sign in to your Kormobot AI account'}
                </p>
              </div>

              {errorMsg && (
                <Alert
                  variant="destructive"
                  className="mt-6 bg-destructive/5 border-destructive/25"
                >
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-xs font-medium">
                    {errorMsg}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="mt-9">
                {/* Email */}
                <Label htmlFor="email" className={labelCls}>
                  {bn ? 'ইমেইল ঠিকানা' : 'Email Address'}
                </Label>
                <div className="relative mt-[6px]">
                  <Mail className="w-[18px] h-[18px] text-[#6b7280] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.6]" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={bn ? 'আপনার ইমেইল লিখুন' : 'Enter your email'}
                    className={`${inputCls} pl-11 pr-4`}
                  />
                </div>

                {/* Password */}
                <Label htmlFor="password" className={`${labelCls} mt-5 flex`}>
                  {bn ? 'পাসওয়ার্ড' : 'Password'}
                </Label>
                <div className="relative mt-[6px]">
                  <Lock className="w-[18px] h-[18px] text-[#6b7280] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.6]" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={bn ? 'আপনার পাসওয়ার্ড লিখুন' : 'Enter your password'}
                    className={`${inputCls} pl-11 pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#110f2e] transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <Eye className="w-[18px] h-[18px] stroke-[1.6]" />
                    ) : (
                      <EyeOff className="w-[18px] h-[18px] stroke-[1.6]" />
                    )}
                  </button>
                </div>

                {/* Remember / forgot */}
                <div className="flex items-center justify-between mt-[26px]">
                  <div className="flex items-center gap-[10px]">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(c) => setRememberMe(Boolean(c))}
                      className="w-4 h-4 rounded-[4px] border-[#bfc4d2] shadow-none cursor-pointer data-[state=checked]:bg-[#5524d8] data-[state=checked]:border-[#5524d8]"
                    />
                    <Label
                      htmlFor="remember-me"
                      className="text-sm leading-5 font-medium text-[#1c1a3a] cursor-pointer"
                    >
                      {bn ? 'মনে রাখুন' : 'Remember me'}
                    </Label>
                  </div>
                  <Link
                    href="/forgot-password"
                    style={{ color: PURPLE }}
                    className="text-sm leading-5 font-semibold hover:underline"
                  >
                    {bn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                  </Link>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  style={{ background: PURPLE }}
                  className="w-full h-[46px] mt-[32px] rounded-[6px] text-white font-semibold text-[15px] gap-2 shadow-none cursor-pointer transition-colors hover:!bg-[#4719b8]"
                >
                  {loginMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                  <span>
                    {loginMutation.isPending
                      ? t.common.loading
                      : bn
                        ? 'সাইন ইন'
                        : 'Sign In'}
                  </span>
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center mt-[28px]">
                <div className="flex-1 border-t border-[#d9dce6]" />
                <span className="px-[16px] text-xs sm:text-sm leading-5 text-[#5b6070]">
                  {bn ? 'অথবা চালিয়ে যান' : 'Or continue with'}
                </span>
                <div className="flex-1 border-t border-[#d9dce6]" />
              </div>

              {/* Social */}
              <div className="grid grid-cols-2 gap-[16px] mt-[24px]">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="h-[46px] rounded-[6px] border border-[#d9dce6] bg-white hover:bg-gray-50 flex items-center justify-center gap-2.5 font-semibold text-sm text-[#110f2e] transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleGithubLogin}
                  className="h-[46px] rounded-[6px] border border-[#d9dce6] bg-white hover:bg-gray-50 flex items-center justify-center gap-2.5 font-semibold text-sm text-[#110f2e] transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5 shrink-0 fill-[#110f2e]" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              <p className="text-center text-sm leading-5 text-[#4b5068] mt-[30px]">
                {bn ? 'কোনো অ্যাকাউন্ট নেই?' : "Don't have an account?"}{' '}
                <Link
                  href="/sign-up"
                  style={{ color: PURPLE }}
                  className="font-semibold hover:underline"
                >
                  {bn ? 'সাইন আপ' : 'Sign Up'}
                </Link>
              </p>
            </div>
          </div>

          {/* ----- Right: showcase ----- */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#f6f4fd] to-[#eeeafb] border-t lg:border-t-0 lg:border-l border-[#ece8f7] px-6 py-10 lg:pl-[62px] lg:pr-[40px] lg:pt-[103px] lg:pb-[40px]">
            <DotGrid
              rows={4}
              cols={6}
              gapX={18}
              gapY={14}
              className="absolute right-[28px] top-[30px]"
            />

            <Illustration />

            <div className="mt-[45px]">
              <h2
                style={{ color: INK }}
                className="text-xl lg:text-2xl leading-snug font-extrabold tracking-[-0.02em]"
              >
                {bn ? 'চাকরি খুঁজুন ও স্বয়ংক্রিয় আবেদন করুন' : 'Find & Auto-Apply to Jobs'}
              </h2>
              <p className="text-sm lg:text-[15px] leading-relaxed text-[#4b5068] mt-2.5 max-w-[405px]">
                {bn
                  ? 'এআইকে আপনার চাকরি খোঁজা, আবেদন এবং রিজিউম ম্যাচিং সামলাতে দিন—সময় বাঁচান এবং বেশি সুযোগ পান।'
                  : 'Let AI handle your job search, application, and resume matching—save time and get more opportunities.'}
              </p>
            </div>

            <div className="mt-[27px] space-y-[11px]">
              {features.map((feat) => (
                <div key={feat.label} className="flex items-center gap-[18px] lg:ml-[1px]">
                  <div className="w-10 h-10 rounded-[8px] bg-[#e9e4fb] flex items-center justify-center shrink-0 text-[#5524d8]">
                    {feat.icon === 'zap' && <Zap className="w-5 h-5 fill-[#5524d8]" />}
                    {feat.icon === 'layers' && <Layers className="w-5 h-5 stroke-[1.8]" />}
                    {feat.icon === 'chart' && <MiniBars className="w-5 h-5" />}
                  </div>
                  <span style={{ color: INK }} className="text-sm font-semibold">
                    {feat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ================= Footer (94px) ================= */}
      <footer className="w-full bg-white border-t border-[#e9eaf2] relative z-20">
        <div className="relative max-w-[1108px] mx-auto px-4 xl:px-0 min-h-[94px] flex flex-col sm:flex-row items-center justify-between gap-4 py-4 sm:py-0">
          <Brand size={32} text={23} />

          <div className="flex items-center gap-8 text-[16px] font-medium text-[#3d4257] lg:absolute lg:left-[429px]">
            <Link href="/#privacy" className="hover:text-[#110f2e] transition-colors">Privacy</Link>
            <Link href="/#terms" className="hover:text-[#110f2e] transition-colors">Terms</Link>
            <Link href="/#security" className="hover:text-[#110f2e] transition-colors">Security</Link>
            <Link href="/#help" className="hover:text-[#110f2e] transition-colors">Help</Link>
          </div>

          <div className="flex items-center gap-[26px] text-[#110f2e]">
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:opacity-75 transition-opacity">
              <svg className="w-[22px] h-[22px] fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:opacity-75 transition-opacity">
              <svg className="w-[22px] h-[22px] fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" className="hover:opacity-75 transition-opacity">
              <svg className="w-[22px] h-[22px] fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}