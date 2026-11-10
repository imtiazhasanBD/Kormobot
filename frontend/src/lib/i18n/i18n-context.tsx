'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Locale, translations, TranslationSchema } from './translations';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationSchema;
  toggleLocale: () => void;
  isDetecting: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [isDetecting, setIsDetecting] = useState<boolean>(true);

  useEffect(() => {
    // 1. Check if user already manually selected a language
    const savedLocale = localStorage.getItem('kormobot_locale') as Locale | null;
    if (savedLocale === 'bn' || savedLocale === 'en') {
      setLocaleState(savedLocale);
      setIsDetecting(false);
      return;
    }

    // 2. IP Geolocation detection for Bangladesh (BD)
    const detectCountryByIp = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data?.country_code === 'BD' || data?.country === 'Bangladesh') {
            setLocaleState('bn');
            localStorage.setItem('kormobot_locale', 'bn');
            setIsDetecting(false);
            return;
          }
        }
      } catch {
        // Fallback to browser locale
        if (typeof navigator !== 'undefined') {
          const lang = navigator.language || (navigator as any).userLanguage || '';
          if (lang.toLowerCase().includes('bn')) {
            setLocaleState('bn');
            setIsDetecting(false);
            return;
          }
        }
      }

      setLocaleState('en');
      setIsDetecting(false);
    };

    detectCountryByIp();
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('kormobot_locale', newLocale);
  };

  const toggleLocale = () => {
    const next: Locale = locale === 'en' ? 'bn' : 'en';
    setLocale(next);
  };

  const t: TranslationSchema = translations[locale];

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        toggleLocale,
        isDetecting,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
