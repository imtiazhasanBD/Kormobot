'use client';

import { useI18n } from '@/lib/i18n/i18n-context';
import { Bookmark, Sparkles, Building2, ExternalLink } from 'lucide-react';

export default function SavedJobsPage() {
  const { t, locale } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {t.nav.savedJobs}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {locale === 'bn'
            ? 'আপনার সংরক্ষিত চাকরির তালিকা। এখান থেকে সরাসরি এক ক্লিকে আবেদন করুন।'
            : 'Track bookmarked jobs and launch autonomous AI applications with a single click.'}
        </p>
      </div>

      <div className="bg-white rounded-md border border-[#e5e7eb] p-8 text-center shadow-2xs">
        <div className="w-12 h-12 rounded-md bg-[#371ee1]/10 border border-[#371ee1]/20 flex items-center justify-center text-[#371ee1] mx-auto mb-3">
          <Bookmark className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">
          {locale === 'bn' ? 'কোন সংরক্ষিত চাকরি নেই' : 'No saved jobs yet'}
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
          {locale === 'bn'
            ? 'চাকরি খোঁজার পৃষ্ঠা থেকে বুকমার্ক আইকনে ক্লিক করে চাকরি সংরক্ষণ করুন।'
            : 'Bookmark jobs from the Jobs discovery page to review and apply later.'}
        </p>
      </div>
    </div>
  );
}

