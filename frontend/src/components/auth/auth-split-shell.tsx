'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { SiteShell } from '@/components/site-shell';
import {
  AlertCircle,
  CheckCircle2,
  Zap,
  Layers,
  Check,
  Sparkles,
  Rocket,
  ShieldCheck,
  KeyRound,
  Clock,
  FileText,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

export type AuthShowcaseVariant = 'sign-in' | 'sign-up' | 'forgot-password';

export interface AuthShowcaseFeature {
  icon: React.ReactNode;
  label: string;
}

export interface AuthShowcaseConfig {
  illustration: React.ReactNode;
  title: string;
  description: string;
  features: AuthShowcaseFeature[];
}

export const authInputCls =
  'h-[46px] rounded-md border-input bg-card text-sm md:text-sm text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring';

export const authLabelCls = 'text-sm leading-5 font-semibold text-foreground';

function DotGrid({
  rows,
  cols,
  gapX,
  gapY,
  className = '',
}: {
  rows: number;
  cols: number;
  gapX: number;
  gapY: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        gridTemplateColumns: `repeat(${cols}, 4px)`,
        columnGap: gapX,
        rowGap: gapY,
      }}
      className={`grid pointer-events-none select-none ${className}`}
    >
      {Array.from({ length: rows * cols }).map((_, i) => (
        <span key={i} className="w-1 h-1 rounded-full bg-primary/20" />
      ))}
    </div>
  );
}

function MiniBars({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="13" width="4" height="7" rx="1" fill="currentColor" />
      <rect x="10" y="9" width="4" height="11" rx="1" fill="currentColor" />
      <rect x="16" y="4" width="4" height="16" rx="1" fill="currentColor" />
    </svg>
  );
}

function IllustrationFrame({
  leftTile,
  windowBody,
  floatingCard,
}: {
  leftTile: React.ReactNode;
  windowBody: React.ReactNode;
  floatingCard: React.ReactNode;
}) {
  return (
    <div className="relative w-[420px] max-w-full h-[260px] lg:-ml-[22px]">
      <svg
        viewBox="0 0 390 245"
        className="absolute left-0 top-0 w-[390px] h-[245px] text-primary/10"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M20 150 C0 110 40 100 90 90 C130 20 200 0 270 5 C340 10 392 60 385 130 C380 190 330 220 270 235 C200 245 120 235 80 215 C40 195 25 175 20 150 Z"
        />
      </svg>

      <svg
        className="absolute left-[68px] top-[21px] w-[48px] h-[44px] text-primary"
        viewBox="0 0 48 44"
        fill="none"
        aria-hidden="true"
      >
        <line x1="1.5" y1="28" x2="21" y2="41" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <line x1="19.5" y1="11.5" x2="22.5" y2="16" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <line x1="38" y1="3" x2="43.5" y2="23" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      </svg>

      <div className="absolute left-[95px] top-[82px] w-[244px] h-[158px] rounded-md border-2 border-foreground/85 bg-card overflow-hidden">
        <div className="h-[26px] bg-brand-mid border-b-2 border-foreground/85 flex items-center gap-[6px] pl-[14px]">
          <span className="w-2 h-2 rounded-full bg-primary-foreground" />
          <span className="w-2 h-2 rounded-full bg-primary-foreground" />
          <span className="w-2 h-2 rounded-full bg-primary-foreground" />
        </div>

        <div className="absolute left-[21px] top-[44px] w-[81px] h-[69px] rounded-md bg-accent flex items-center justify-center text-primary">
          {leftTile}
        </div>
        <span className="absolute left-[29px] top-[126px] w-[66px] h-[5px] rounded-full bg-primary/20" />

        {windowBody}
      </div>

      <div className="absolute left-[300px] top-[177px] w-[104px] h-[74px] rounded-md border-2 border-foreground/85 bg-card flex items-center justify-center z-10">
        {floatingCard}
      </div>
    </div>
  );
}

function SignInIllustration() {
  return (
    <IllustrationFrame
      leftTile={
        <svg width="46" height="46" viewBox="0 0 48 48" fill="none">
          <line x1="24" y1="5" x2="24" y2="11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <circle cx="24" cy="4.5" r="2.2" fill="currentColor" />
          <rect x="9" y="11.5" width="30" height="24" rx="8" fill="var(--card)" stroke="currentColor" strokeWidth="3.4" />
          <circle cx="18.2" cy="23.5" r="2.7" fill="currentColor" />
          <circle cx="29.8" cy="23.5" r="2.7" fill="currentColor" />
          <path d="M4.5 20V28" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M43.5 20V28" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
        </svg>
      }
      windowBody={
        <>
          {[0, 1, 2].map((r) => (
            <div
              key={r}
              style={{ top: 49 + r * 27 }}
              className="absolute left-[127px] flex items-center gap-[9px]"
            >
              <span className="w-[15px] h-[15px] rounded-full bg-success text-success-foreground flex items-center justify-center">
                <Check className="w-2.5 h-2.5 stroke-[2.6]" />
              </span>
              <span className="space-y-[3px]">
                <span className="block h-[3px] w-[55px] rounded-full bg-muted-foreground/35" />
                <span className="block h-[3px] w-[36px] rounded-full bg-muted" />
              </span>
            </div>
          ))}
        </>
      }
      floatingCard={
        <div className="w-full h-full flex items-end justify-center gap-[7px] pb-[18px]">
          <span className="w-[11px] h-[14px] rounded-xs bg-chart-3" />
          <span className="w-[11px] h-[26px] rounded-xs bg-chart-2" />
          <span className="w-[11px] h-[38px] rounded-xs bg-primary" />
        </div>
      }
    />
  );
}

function SignUpIllustration() {
  return (
    <IllustrationFrame
      leftTile={<FileText className="w-9 h-9 stroke-[2]" />}
      windowBody={
        <div className="absolute left-[123px] top-[46px] right-[18px] space-y-2.5">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="h-[4px] w-[48px] rounded-full bg-foreground/70" />
              <span className="h-[4px] w-[18px] rounded-full bg-primary" />
            </div>
            <div className="h-[6px] w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[86%] rounded-full bg-primary" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="h-[4px] w-[42px] rounded-full bg-muted-foreground/45" />
              <span className="h-[4px] w-[18px] rounded-full bg-chart-2" />
            </div>
            <div className="h-[6px] w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[72%] rounded-full bg-chart-2" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="w-3.5 h-3.5 rounded-full bg-success text-success-foreground flex items-center justify-center">
              <Check className="w-2 h-2 stroke-[2.8]" />
            </span>
            <span className="h-[4px] w-[62px] rounded-full bg-muted-foreground/40" />
          </div>
        </div>
      }
      floatingCard={
        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="w-7 h-7 rounded-md bg-primary/15 text-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1">
            <span className="w-5 h-1.5 rounded-full bg-primary" />
            <span className="w-3 h-1.5 rounded-full bg-success" />
          </div>
        </div>
      }
    />
  );
}

function ForgotPasswordIllustration() {
  return (
    <IllustrationFrame
      leftTile={<ShieldCheck className="w-9 h-9 stroke-[2]" />}
      windowBody={
        <div className="absolute left-[122px] top-[48px] right-[16px] space-y-3">
          <div className="grid grid-cols-6 gap-1">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className="h-6 rounded-xs border border-primary/30 bg-accent flex items-center justify-center"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              </span>
            ))}
          </div>

          <div className="space-y-1.5">
            <span className="block h-[4px] w-[82px] rounded-full bg-muted-foreground/35" />
            <span className="block h-[4px] w-[58px] rounded-full bg-muted" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-success text-success-foreground flex items-center justify-center">
              <Check className="w-2 h-2 stroke-[2.8]" />
            </span>
            <span className="h-[4px] w-[46px] rounded-full bg-success/55" />
          </div>
        </div>
      }
      floatingCard={
        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="w-7 h-7 rounded-md bg-success-muted text-success flex items-center justify-center">
            <KeyRound className="w-4 h-4" />
          </div>
          <span className="w-9 h-1.5 rounded-full bg-success" />
        </div>
      }
    />
  );
}

export function GoogleLogo({ className = 'w-5 h-5 shrink-0' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

export function GithubLogo({ className = 'w-5 h-5 shrink-0 fill-current' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function getShowcaseConfig(variant: AuthShowcaseVariant, bn: boolean): AuthShowcaseConfig {
  switch (variant) {
    case 'sign-up':
      return {
        illustration: <SignUpIllustration />,
        title: bn ? 'আপনার এআই জব কোপাইলট শুরু করুন' : 'Launch Your AI Job Copilot',
        description: bn
          ? 'ফ্রি অ্যাকাউন্ট তৈরি করুন, একবার রিজিউম আপলোড করুন এবং কর্মবট এআইকে সেরা চাকরিতে স্বয়ংক্রিয়ভাবে আবেদন করতে দিন।'
          : 'Create your free account, upload your resume once, and let Kormobot AI match and auto-apply to top roles.',
        features: [
          {
            icon: <Sparkles className="w-5 h-5" />,
            label: bn ? '১-মিনিটে প্রোফাইল ও রিজিউম সেটআপ' : '1-Minute Profile & Resume Setup',
          },
          {
            icon: <CheckCircle2 className="w-5 h-5" />,
            label: bn ? 'ইমেইল ওটিপি যাচাইকৃত নিরাপত্তা' : 'OTP Verified Account Security',
          },
          {
            icon: <Rocket className="w-5 h-5" />,
            label: bn ? 'তাৎক্ষণিক এআই জব ম্যাচিং' : 'Instant AI Resume Tailoring',
          },
        ],
      };

    case 'forgot-password':
      return {
        illustration: <ForgotPasswordIllustration />,
        title: bn ? 'নিরাপদ অ্যাকাউন্ট পুনরুদ্ধার' : 'Secure Account Recovery',
        description: bn
          ? '৬-সংখ্যার ইমেইল ওটিপি যাচাইকরণ এবং এনক্রিপ্টেড পাসওয়ার্ড রিসেটের মাধ্যমে দ্রুত আপনার অ্যাকাউন্টে ফিরে যান।'
          : 'Regain access in seconds with 6-digit email OTP verification and encrypted password reset protection.',
        features: [
          {
            icon: <KeyRound className="w-5 h-5" />,
            label: bn ? 'তাৎক্ষণিক ৬-সংখ্যার ইমেইল ওটিপি' : 'Instant 6-Digit Email OTP',
          },
          {
            icon: <ShieldCheck className="w-5 h-5" />,
            label: bn ? 'এনক্রিপ্টেড পাসওয়ার্ড সুরক্ষা' : 'Encrypted Password Protection',
          },
          {
            icon: <Clock className="w-5 h-5" />,
            label: bn ? 'কোনো ডেটা ছাড়াই দ্রুত পুনরুদ্ধার' : 'Zero Data Loss Recovery',
          },
        ],
      };

    case 'sign-in':
    default:
      return {
        illustration: <SignInIllustration />,
        title: bn ? 'চাকরি খুঁজুন ও স্বয়ংক্রিয় আবেদন করুন' : 'Find & Auto-Apply to Jobs',
        description: bn
          ? 'এআইকে আপনার চাকরি খোঁজা, আবেদন এবং রিজিউম ম্যাচিং সামলাতে দিন—সময় বাঁচান এবং বেশি সুযোগ পান।'
          : 'Let AI handle your job search, application, and resume matching—save time and get more opportunities.',
        features: [
          {
            icon: <Zap className="w-5 h-5 fill-current" />,
            label: bn ? 'স্বয়ংক্রিয় চাকরি আবেদন' : 'Autonomous Job Apply',
          },
          {
            icon: <Layers className="w-5 h-5 stroke-[1.8]" />,
            label: bn ? 'এআই রিজিউম পার্সিং' : 'AI Resume Parsing',
          },
          {
            icon: <MiniBars className="w-5 h-5" />,
            label: bn ? 'স্মার্ট জব ম্যাচিং' : 'Smart Job Matching',
          },
        ],
      };
  }
}

interface AuthSplitShellProps {
  variant?: AuthShowcaseVariant;
  showcase?: AuthShowcaseConfig;
  title: string;
  subtitle: React.ReactNode;
  errorMsg?: string;
  infoMsg?: string;
  children: React.ReactNode;
}

export function AuthSplitShell({
  variant = 'sign-in',
  showcase,
  title,
  subtitle,
  errorMsg,
  infoMsg,
  children,
}: AuthSplitShellProps) {
  const { locale } = useI18n();
  const bn = locale === 'bn';

  const activeShowcase = showcase ?? getShowcaseConfig(variant, bn);

  return (
    <SiteShell>
      <main className="flex-1 relative overflow-hidden px-4 py-10 lg:pt-[126px] lg:pb-[137px]">
        {/* top-left concentric arcs */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute left-[-272px] top-[-292px] w-[464px] h-[464px] rounded-full border border-border"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute left-[-216px] top-[-236px] w-[352px] h-[352px] rounded-full border border-border"
        />

        {/* bottom-left dots */}
        <DotGrid
          rows={5}
          cols={8}
          gapX={19}
          gapY={20}
          className="hidden lg:grid absolute left-[36px] bottom-[43px]"
        />

        {/* bottom-right arc + blob */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute right-[-226px] bottom-[-380px] w-[500px] h-[500px] rounded-full border border-primary/15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute right-[-194px] bottom-[-328px] w-[396px] h-[396px] rounded-full bg-gradient-to-t from-primary/35 to-accent"
        />

        {/* ---------- Card ---------- */}
        <Card className="relative z-10 w-full max-w-[1108px] mx-auto p-0 gap-0 rounded-md bg-card border-border shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-[577fr_531fr] lg:min-h-[680px]">
          {/* ----- Left: form ----- */}
          <CardContent className="bg-card px-6 py-10 lg:pl-[63px] lg:pr-[48px] lg:pt-[72px] lg:pb-[45px]">
            <div className="w-full max-w-[466px]">
              <div className="lg:pl-[18px]">
                <h1 className="text-2xl lg:text-[30px] leading-tight font-extrabold tracking-[-0.02em] text-foreground">
                  {title}
                </h1>
                <p className="text-sm lg:text-[15px] leading-6 text-muted-foreground mt-2">
                  {subtitle}
                </p>
              </div>

              {errorMsg && (
                <Alert
                  variant="destructive"
                  className="mt-6 bg-destructive/5 border-destructive/25"
                >
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="text-xs font-medium">
                    {errorMsg}
                  </AlertDescription>
                </Alert>
              )}

              {infoMsg && (
                <Alert className="mt-6 bg-success-muted border-success-border text-success-muted-foreground [&>svg]:text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  <AlertDescription className="text-xs font-medium text-success-muted-foreground">
                    {infoMsg}
                  </AlertDescription>
                </Alert>
              )}

              {children}
            </div>
          </CardContent>

          {/* ----- Right: showcase ----- */}
          <div className="relative overflow-hidden bg-gradient-to-br from-accent/70 to-secondary border-t lg:border-t-0 lg:border-l border-border px-6 py-10 lg:pl-[62px] lg:pr-[40px] lg:pt-[103px] lg:pb-[40px]">
            <DotGrid
              rows={4}
              cols={6}
              gapX={18}
              gapY={14}
              className="absolute right-[28px] top-[30px]"
            />

            {activeShowcase.illustration}

            <div className="mt-[45px]">
              <h2 className="text-xl lg:text-2xl leading-snug font-extrabold tracking-[-0.02em] text-foreground">
                {activeShowcase.title}
              </h2>
              <p className="text-sm lg:text-[15px] leading-relaxed text-muted-foreground mt-2.5 max-w-[405px]">
                {activeShowcase.description}
              </p>
            </div>

            <div className="mt-[27px] space-y-[11px]">
              {activeShowcase.features.map((feat) => (
                <div key={feat.label} className="flex items-center gap-[18px] lg:ml-[1px]">
                  <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 text-primary">
                    {feat.icon}
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {feat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </main>
    </SiteShell>
  );
}
