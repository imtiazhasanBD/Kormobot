'use client';

import { useI18n } from '@/lib/i18n/i18n-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import Link from 'next/link';
import { Sparkles, ArrowRight, Zap, Bot, LayoutGrid, Cpu, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-[#f8f9fd] relative overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-[#371ee1]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-gradient-to-t from-[#6366f1]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10 -translate-x-1/3 translate-y-1/3" />

      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-6 h-18 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white">
            <Bot className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-[#0f172a]">
            Kormobot AI
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/sign-in"
            className="text-sm font-semibold px-3.5 py-2 text-[#475569] hover:text-[#0f172a] transition-colors"
          >
            {t.common.login}
          </Link>
          <Link
            href="/sign-up"
            className="text-sm font-semibold px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-all cursor-pointer"
          >
            {t.common.register}
          </Link>
        </div>
      </header>

      {/* Hero Body */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-12 pb-24 max-w-4xl mx-auto z-10">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e0e2f5] bg-[#eeeffe] text-primary text-xs font-semibold mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.common.tagline}</span>
        </div>

        {/* Hero Title with Strong Hierarchy */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#0f172a] leading-[1.14] mb-6">
          Find & Auto-Apply to <span className="bg-gradient-to-r from-primary via-[#5237ea] to-[#7c3aed] bg-clip-text text-transparent">Jobs</span>
        </h1>

        <p className="text-base sm:text-lg text-[#64748b] max-w-2xl mb-10 leading-relaxed font-normal">
          {t.jobs.subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full justify-center">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-primary text-white font-semibold hover:bg-primary/90 transition-all text-sm cursor-pointer shadow-[0_2px_6px_rgba(55,30,225,0.25)]"
          >
            <span>{t.common.register}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md border border-[#cbd5e1] bg-white text-[#334155] hover:bg-[#f8fafc] font-semibold text-sm transition-all cursor-pointer shadow-xs"
          >
            <LayoutGrid className="w-4 h-4 text-[#64748b]" />
            <span>{t.common.dashboard}</span>
          </Link>
        </div>

        {/* Feature Cards Grid (Minimal Corner Rounding: max md) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4.5 mt-16 w-full text-left">
          {/* Card 1 */}
          <div className="p-5 rounded-md border border-[#e2e5f1] bg-white shadow-[0_2px_6px_rgba(15,23,42,0.03)] hover:border-[#cbd5e1] transition-all">
            <div className="w-8 h-8 rounded-md bg-[#f4f3ff] text-primary flex items-center justify-center mb-3.5 border border-[#e0e2f5]">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#0f172a] mb-1">Autonomous Apply</h3>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Auto-fill applications across Greenhouse, Lever, and Workable via local Playwright.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-md border border-[#e2e5f1] bg-white shadow-[0_2px_6px_rgba(15,23,42,0.03)] hover:border-[#cbd5e1] transition-all">
            <div className="w-8 h-8 rounded-md bg-[#eff8ff] text-[#0284c7] flex items-center justify-center mb-3.5 border border-[#b9e6fe]">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#0f172a] mb-1">Dynamic AI Engine</h3>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Instant PDF resume parsing powered by Gemini, OpenAI, Groq, or OpenRouter.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-md border border-[#e2e5f1] bg-white shadow-[0_2px_6px_rgba(15,23,42,0.03)] hover:border-[#cbd5e1] transition-all">
            <div className="w-8 h-8 rounded-md bg-[#ecfdf3] text-[#16a34a] flex items-center justify-center mb-3.5 border border-[#a6f4c5]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#0f172a] mb-1">Zero-Cost Setup</h3>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Run 100% free with local Playwright, PostgreSQL, and open-source AI providers.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
