'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, toggleLocale } = useI18n();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleLocale}
      className={cn('gap-1.5 text-xs font-medium cursor-pointer', className)}
      title="Switch Language / ভাষা পরিবর্তন করুন"
    >
      <Globe className="w-3.5 h-3.5 text-muted-foreground" />
      <span>{locale === 'en' ? 'বাংলা' : 'English'}</span>
    </Button>
  );
}
