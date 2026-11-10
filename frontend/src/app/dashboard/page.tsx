'use client';

import { useI18n } from '@/lib/i18n/i18n-context';
import { useRouter } from 'next/navigation';
import { Bot, LogOut } from 'lucide-react';
import api from '@/lib/api';

export default function DashboardPlaceholder() {
  const { t, locale } = useI18n();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    localStorage.removeItem('kormobot_token');
    document.cookie = 'kormobot_token=; path=/; max-age=0;';
    router.push('/sign-in');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 shadow-sm">
        <Bot className="w-8 h-8" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-2">
        {t.common.dashboard}
      </h1>
      <p className="text-sm text-muted-foreground max-w-md mb-8">
        {locale === 'bn'
          ? 'স্বাগতম! আপনি সফলভাবে লগইন করেছেন। ড্যাশবোর্ড লেআউট পরবর্তী ধাপে যুক্ত করা হবে।'
          : 'Welcome! You are successfully authenticated. Dashboard shell and navigation will be populated in Chapter 3.'}
      </p>

      <button
        onClick={handleLogout}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent text-sm font-medium transition-colors"
      >
        <LogOut className="w-4 h-4 text-muted-foreground" />
        <span>{t.common.logout}</span>
      </button>
    </div>
  );
}

