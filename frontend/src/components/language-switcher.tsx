'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { Globe } from 'lucide-react';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, toggleLocale } = useI18n();

  return (
    <button
      onClick={toggleLocale}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-border bg-background hover:bg-accent transition-colors ${className}`}
      title="Switch Language / ভাষা পরিবর্তন করুন"
    >
      <Globe className="w-3.5 h-3.5 text-muted-foreground" />
      <span>{locale === 'en' ? 'বাংলা' : 'English'}</span>
    </button>
  );
}

