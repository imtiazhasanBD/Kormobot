'use client';

import { useI18n } from '@/lib/i18n/i18n-context';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ApplicationStatusPage() {
  const { t, locale } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {t.nav.applicationStatus}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {locale === 'bn'
            ? 'আপনার স্বয়ংক্রিয় এআই আবেদনের অগ্রগতি এবং হিস্ট্রি দেখুন।'
            : 'Live monitoring of your autonomous AI job applications and submission status.'}
        </p>
      </div>

      <Card className="p-0 shadow-2xs">
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {locale === 'bn' ? 'কোন আবেদন ইতিহাস নেই' : 'No applications submitted yet'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
            {locale === 'bn'
              ? 'চাকরি খুঁজে "Apply with AI" বোতামে চাপ দিলে স্বয়ংক্রিয় আবেদন সম্পন্ন হবে এবং এখানে লগ প্রদর্শিত হবে।'
              : 'Find jobs and click "Apply with AI" to let Stagehand + Playwright auto-fill and submit.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
