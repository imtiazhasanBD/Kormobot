'use client';

import { useI18n } from '@/lib/i18n/i18n-context';
import { CheckCircle2, Clock, XCircle, ArrowUpRight, Search } from 'lucide-react';

export default function ApplicationStatusPage() {
  const { t, locale } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {t.nav.applicationStatus}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {locale === 'bn'
            ? 'আপনার স্বয়ংক্রিয় এআই আবেদনের অগ্রগতি এবং হিস্ট্রি দেখুন।'
            : 'Live monitoring of your autonomous AI job applications and submission status.'}
        </p>
      </div>

      <div className="bg-white rounded-md border border-[#e5e7eb] p-8 text-center shadow-2xs">
        <div className="w-12 h-12 rounded-md bg-[#371ee1]/10 border border-[#371ee1]/20 flex items-center justify-center text-[#371ee1] mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">
          {locale === 'bn' ? 'কোন আবেদন ইতিহাস নেই' : 'No applications submitted yet'}
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
          {locale === 'bn'
            ? 'চাকরি খুঁজে "Apply with AI" বোতামে চাপ দিলে স্বয়ংক্রিয় আবেদন সম্পন্ন হবে এবং এখানে লগ প্রদর্শিত হবে।'
            : 'Find jobs and click "Apply with AI" to let Stagehand + Playwright auto-fill and submit.'}
        </p>
      </div>
    </div>
  );
}

