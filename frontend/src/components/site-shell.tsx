'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/i18n-context';
import { Button } from '@/components/ui/button';

export function BrandIcon({ size }: { size: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-md bg-primary text-primary-foreground flex items-center justify-center shrink-0"
    >
      <svg width={size * 0.66} height={size * 0.66} viewBox="0 0 24 24" fill="none">
        <line x1="12" y1="2.6" x2="12" y2="6.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="2.6" r="1.4" fill="currentColor" />
        <rect x="4.5" y="6.5" width="15" height="12.5" rx="4.2" fill="currentColor" />
        <circle cx="9.3" cy="12.8" r="1.55" fill="var(--primary)" />
        <circle cx="14.7" cy="12.8" r="1.55" fill="var(--primary)" />
        <path d="M2.4 10.8V15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M21.6 10.8V15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function Brand({ size, text }: { size: number; text: number }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3 shrink-0">
      <BrandIcon size={size} />
      <span
        style={{ fontSize: text }}
        className="font-extrabold tracking-tight leading-none text-foreground"
      >
        Kormobot <span className="text-primary">AI</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const { locale } = useI18n();
  const bn = locale === 'bn';

  const navLinks = [
    { href: '/', label: bn ? 'হোম' : 'Home' },
    { href: '/#features', label: bn ? 'বৈশিষ্ট্য' : 'Features' },
    { href: '/#pricing', label: bn ? 'মূল্য' : 'Pricing' },
    { href: '/#docs', label: bn ? 'ডক্স' : 'Docs' },
    { href: '/#contact', label: bn ? 'যোগাযোগ' : 'Contact' },
  ];

  return (
    <header className="w-full h-[93px] bg-card border-b border-border sticky top-0 z-30">
      <div className="relative max-w-[1120px] h-full mx-auto px-4 xl:px-0 flex items-center justify-between">
        <Brand size={36} text={26} />

        <nav className="hidden lg:flex items-center gap-[43px] text-base font-medium text-foreground/85 absolute left-[392px]">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 shrink-0">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/sign-in" />}
            className="h-11 min-w-[90px] px-4 rounded-md bg-card text-sm font-semibold text-foreground"
          >
            {bn ? 'সাইন ইন' : 'Sign In'}
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/sign-up" />}
            className="h-11 min-w-[97px] px-4 rounded-md text-sm font-semibold"
          >
            {bn ? 'সাইন আপ' : 'Sign Up'}
          </Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="w-full bg-card border-t border-border relative z-20">
      <div className="relative max-w-[1108px] mx-auto px-4 xl:px-0 min-h-[94px] flex flex-col sm:flex-row items-center justify-between gap-4 py-4 sm:py-0">
        <Brand size={32} text={23} />

        <div className="flex items-center gap-8 text-sm font-medium text-muted-foreground lg:absolute lg:left-[429px]">
          <Link href="/#privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/#terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <Link href="/#security" className="hover:text-foreground transition-colors">
            Security
          </Link>
          <Link href="/#help" className="hover:text-foreground transition-colors">
            Help
          </Link>
        </div>

        <div className="flex items-center gap-[26px] text-foreground">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="hover:opacity-75 transition-opacity"
          >
            <svg className="w-[22px] h-[22px] fill-current" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="hover:opacity-75 transition-opacity"
          >
            <svg className="w-[22px] h-[22px] fill-current" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
            className="hover:opacity-75 transition-opacity"
          >
            <svg className="w-[22px] h-[22px] fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-clip">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}

