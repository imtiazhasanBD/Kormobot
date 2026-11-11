'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n/i18n-context';
import { loginSchema } from '@/lib/validations/auth.schema';
import { Mail, Lock, Loader2, EyeOff, Eye } from 'lucide-react';
import {
  AuthSplitShell,
  authInputCls,
  authLabelCls,
  GoogleLogo,
  GithubLogo,
} from '@/components/auth/auth-split-shell';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

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

  return (
    <AuthSplitShell
      variant="sign-in"
      title={bn ? 'স্বাগতম' : 'Welcome Back'}
      subtitle={
        bn
          ? 'আপনার কর্মবট এআই অ্যাকাউন্টে সাইন ইন করুন'
          : 'Sign in to your Kormobot AI account'
      }
      errorMsg={errorMsg}
    >
      <form onSubmit={handleSubmit} className="mt-9">
        {/* Email */}
        <Label htmlFor="email" className={authLabelCls}>
          {bn ? 'ইমেইল ঠিকানা' : 'Email Address'}
        </Label>
        <div className="relative mt-[6px]">
          <Mail className="w-[18px] h-[18px] text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.6]" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={bn ? 'আপনার ইমেইল লিখুন' : 'Enter your email'}
            className={`${authInputCls} pl-11 pr-4`}
          />
        </div>

        {/* Password */}
        <Label htmlFor="password" className={`${authLabelCls} mt-5 flex`}>
          {bn ? 'পাসওয়ার্ড' : 'Password'}
        </Label>
        <div className="relative mt-[6px]">
          <Lock className="w-[18px] h-[18px] text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.6]" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={bn ? 'আপনার পাসওয়ার্ড লিখুন' : 'Enter your password'}
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

        {/* Remember / forgot */}
        <div className="flex items-center justify-between mt-[26px]">
          <div className="flex items-center gap-[10px]">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(c) => setRememberMe(Boolean(c))}
              className="w-4 h-4 rounded-[4px] border-input shadow-none cursor-pointer"
            />
            <Label
              htmlFor="remember-me"
              className="text-sm leading-5 font-medium text-foreground/85 cursor-pointer"
            >
              {bn ? 'মনে রাখুন' : 'Remember me'}
            </Label>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm leading-5 font-semibold text-primary hover:underline"
          >
            {bn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
          </Link>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full h-[46px] mt-[32px] rounded-md font-semibold text-[15px] gap-2 shadow-none cursor-pointer"
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
        <Separator className="flex-1" />
        <span className="px-[16px] text-xs sm:text-sm leading-5 text-muted-foreground">
          {bn ? 'অথবা চালিয়ে যান' : 'Or continue with'}
        </span>
        <Separator className="flex-1" />
      </div>

      {/* Social */}
      <div className="grid grid-cols-2 gap-[16px] mt-[24px]">
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

      <p className="text-center text-sm leading-5 text-muted-foreground mt-[30px]">
        {bn ? 'কোনো অ্যাকাউন্ট নেই?' : "Don't have an account?"}{' '}
        <Link href="/sign-up" className="font-semibold text-primary hover:underline">
          {bn ? 'সাইন আপ' : 'Sign Up'}
        </Link>
      </p>
    </AuthSplitShell>
  );
}
