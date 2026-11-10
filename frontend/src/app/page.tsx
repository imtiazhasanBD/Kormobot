'use client';

import { useI18n } from '@/lib/i18n/i18n-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import Link from 'next/link';
import { Bot, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Bot className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              {t.common.appName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/sign-in"
              className="text-sm font-medium px-4 py-2 rounded-md hover:bg-accent transition-colors"
            >
              {t.common.login}
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-medium px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t.common.register}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.common.tagline}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-6">
          {t.jobs.title}
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          {t.jobs.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-sm transition-all"
          >
            <span>{t.common.register}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-border bg-background hover:bg-accent font-semibold transition-all"
          >
            <span>{t.common.dashboard}</span>
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 w-full text-left">
          <div className="p-5 rounded-xl border border-border bg-card/50">
            <Zap className="w-5 h-5 text-primary mb-3" />
            <h3 className="font-semibold text-sm mb-1">Autonomous Apply</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Auto-fills application forms across Greenhouse, Lever, and Workable via local Playwright.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card/50">
            <Sparkles className="w-5 h-5 text-primary mb-3" />
            <h3 className="font-semibold text-sm mb-1">Dynamic AI Engine</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Instant PDF resume parsing powered by switchable Gemini, OpenAI, Groq, or OpenRouter.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card/50">
            <ShieldCheck className="w-5 h-5 text-primary mb-3" />
            <h3 className="font-semibold text-sm mb-1">Zero-Cost Setup</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Runs 100% free with local Playwright, PostgreSQL, and free-tier search & AI providers.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
