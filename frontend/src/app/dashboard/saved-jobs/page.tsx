'use client';

import { useI18n } from '@/lib/i18n/i18n-context';
import { Bookmark } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function SavedJobsPage() {
  const { t, locale } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {t.nav.savedJobs}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {locale === 'bn'
            ? 'আপনার সংরক্ষিত চাকরির তালিকা। এখান থেকে সরাসরি এক ক্লিকে আবেদন করুন।'
            : 'Track bookmarked jobs and launch autonomous AI applications with a single click.'}
        </p>
      </div>

      <Card className="p-0 shadow-2xs">
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-3">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {locale === 'bn' ? 'কোন সংরক্ষিত চাকরি নেই' : 'No saved jobs yet'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
            {locale === 'bn'
              ? 'চাকরি খোঁজার পৃষ্ঠা থেকে বুকমার্ক আইকনে ক্লিক করে চাকরি সংরক্ষণ করুন।'
              : 'Bookmark jobs from the Jobs discovery page to review and apply later.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
