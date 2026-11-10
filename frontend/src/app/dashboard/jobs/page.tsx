'use client';

import { useI18n } from '@/lib/i18n/i18n-context';
import { Search, MapPin, Filter, Sparkles, Building2, ExternalLink, Bookmark } from 'lucide-react';
import { useState } from 'react';

export default function JobsPage() {
  const { t, locale } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.jobs.title}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {t.jobs.subtitle}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-md border border-[#e5e7eb] shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.jobs.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-md border border-[#e5e7eb] focus:outline-hidden focus:border-[#371ee1] focus:ring-1 focus:ring-[#371ee1] transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-[#e5e7eb] text-sm font-medium text-slate-700 hover:bg-[#f8f9fd] transition-colors">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{locale === 'bn' ? 'অবস্থান' : 'Location'}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-[#e5e7eb] text-sm font-medium text-slate-700 hover:bg-[#f8f9fd] transition-colors">
              <Filter className="w-4 h-4 text-slate-400" />
              <span>{locale === 'bn' ? 'ফিল্টার' : 'Filters'}</span>
            </button>
            <button className="px-5 py-2.5 rounded-md bg-[#371ee1] hover:bg-[#2e17c4] text-white text-sm font-semibold transition-colors flex items-center gap-2 shadow-xs">
              <Sparkles className="w-4 h-4" />
              <span>{locale === 'bn' ? 'অনুসন্ধান' : 'Search Jobs'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Job listings empty state / placeholder card */}
      <div className="bg-white rounded-md border border-[#e5e7eb] p-8 text-center shadow-2xs">
        <div className="w-12 h-12 rounded-md bg-[#371ee1]/10 border border-[#371ee1]/20 flex items-center justify-center text-[#371ee1] mx-auto mb-3">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">
          {locale === 'bn' ? 'কোন চাকরি লোড করা হয়নি' : 'No jobs searched yet'}
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
          {locale === 'bn'
            ? 'চাকরির পদবি বা প্রযুক্তি লিখে এআই দিয়ে চাকরি খুঁজুন এবং সরাসরি স্বয়ংক্রিয়ভাবে আবেদন করুন।'
            : 'Enter a role or keywords above to query Greenhouse, Lever, and Workable via Tavily/Brave/Serper.'}
        </p>
      </div>
    </div>
  );
}

