'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n/i18n-context';
import { SiteShell } from '@/components/site-shell';
import { PlatformShowcase } from '@/components/landing/platform-showcase';
import { Sparkles, ArrowRight, Zap, LayoutGrid, Cpu, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const { t } = useI18n();

  return (
    <SiteShell>
      {/* Hero Body */}
      <main className="flex-1 relative overflow-hidden flex flex-col items-center justify-center text-center px-6 py-16 sm:py-24">
        {/* Background Soft Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-gradient-to-t from-chart-2/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10 -translate-x-1/3 translate-y-1/3" />

        <div className="max-w-4xl mx-auto w-full flex flex-col items-center z-10">
          {/* Pill Badge */}
          <Badge
            variant="secondary"
            className="gap-2 px-3.5 py-1.5 h-auto rounded-full border border-primary/15 bg-accent text-accent-foreground text-xs font-semibold mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.common.tagline}</span>
          </Badge>

          {/* Hero Title with Strong Hierarchy */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.14] mb-6">
            Find & Auto-Apply to{' '}
            <span className="bg-gradient-to-r from-primary via-brand-mid to-brand-end bg-clip-text text-transparent">
              Jobs
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-10 leading-relaxed font-normal">
            {t.jobs.subtitle}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full justify-center">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/sign-up" />}
              className="w-full sm:w-auto gap-2 px-6 py-2.5 h-11 text-sm font-semibold shadow-sm shadow-primary/25"
            >
              <span>{t.common.register}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              nativeButton={false}
              render={<Link href="/dashboard" />}
              className="w-full sm:w-auto gap-2 px-5 py-2.5 h-11 text-sm font-semibold bg-card shadow-xs"
            >
              <LayoutGrid className="w-4 h-4 text-muted-foreground" />
              <span>{t.common.dashboard}</span>
            </Button>
          </div>

          {/* Feature Cards Grid */}
          <div id="features" className="grid grid-cols-1 sm:grid-cols-3 gap-4.5 mt-16 w-full text-left">
            {/* Card 1 */}
            <Card className="p-0 shadow-xs hover:border-ring/40 transition-all">
              <CardContent className="p-5">
                <div className="w-8 h-8 rounded-md bg-accent text-primary flex items-center justify-center mb-3.5 border border-primary/15">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-foreground mb-1">Autonomous Apply</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Auto-fill applications across Greenhouse, Lever, and Workable via local Playwright.
                </p>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="p-0 shadow-xs hover:border-ring/40 transition-all">
              <CardContent className="p-5">
                <div className="w-8 h-8 rounded-md bg-info-muted text-info-muted-foreground flex items-center justify-center mb-3.5 border border-info-border">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-foreground mb-1">Dynamic AI Engine</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Instant PDF resume parsing powered by Gemini, OpenAI, Groq, or OpenRouter.
                </p>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="p-0 shadow-xs hover:border-ring/40 transition-all">
              <CardContent className="p-5">
                <div className="w-8 h-8 rounded-md bg-success-muted text-success-muted-foreground flex items-center justify-center mb-3.5 border border-success-border">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-foreground mb-1">Zero-Cost Setup</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Run 100% free with local Playwright, PostgreSQL, and open-source AI providers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <PlatformShowcase />
    </SiteShell>
  );
}
