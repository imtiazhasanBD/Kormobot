'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n/i18n-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { loginSchema } from '@/lib/validations/auth.schema';
import { Bot, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
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
    onError: (err: AxiosError<{ message?: string | string[] }>) => {
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

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const issue = validation.error.issues?.[0];
      setErrorMsg(issue?.message || 'Please check your inputs.');
      return;
    }

    loginMutation.mutate();
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
              {locale === 'bn' ? 'স্বাগতম' : 'Welcome back'}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground font-normal">
              {locale === 'bn'
                ? 'ড্যাশবোর্ড অ্যাক্সেস করতে আপনার তথ্য লিখুন'
                : 'Enter your credentials to access your dashboard'}
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

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-10 pl-9 bg-background"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider"
                >
                  {locale === 'bn' ? 'পাসওয়ার্ড' : 'PASSWORD'}
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  {locale === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
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
              disabled={loginMutation.isPending}
              className="w-full h-10 font-semibold text-sm gap-2 mt-1 cursor-pointer"
            >
              {loginMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {loginMutation.isPending
                  ? t.common.loading
                  : locale === 'bn'
                    ? 'লগইন করুন'
                    : 'Sign In'}
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
              {locale === 'bn' ? 'গুগল দিয়ে লগইন করুন' : 'Sign in with Google'}
            </span>
          </Button>
        </CardContent>

        <CardFooter className="p-0 border-t-0 bg-transparent justify-center">
          <p className="text-center text-xs text-muted-foreground">
            {locale === 'bn' ? 'কোনো অ্যাকাউন্ট নেই?' : "Don't have an account?"}{' '}
            <Link
              href="/sign-up"
              className="text-primary font-bold hover:underline ml-0.5"
            >
              {locale === 'bn' ? 'নিবন্ধন করুন' : 'Sign up'}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
