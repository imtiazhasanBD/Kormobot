'use client';

import { useI18n } from '@/lib/i18n/i18n-context';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function ResumePage() {
  const { t, locale } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {t.nav.resume}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {locale === 'bn'
            ? 'আপনার জীবনবৃত্তান্ত (PDF) আপলোড করুন। আমাদের এআই এটি পার্স করে স্বয়ংক্রিয়ভাবে ফর্ম পূরণ করবে।'
            : 'Upload your latest PDF resume. Our dynamic AI engine extracts your experience, skills, and projects.'}
        </p>
      </div>

      {/* Upload Box */}
      <div className="border-2 border-dashed border-[#d1d5db] hover:border-[#371ee1] bg-white rounded-md p-10 text-center transition-colors cursor-pointer group">
        <div className="w-12 h-12 rounded-md bg-[#371ee1]/10 border border-[#371ee1]/20 flex items-center justify-center text-[#371ee1] mx-auto mb-4 group-hover:scale-105 transition-transform">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          {locale === 'bn' ? 'পিডিএফ রিজিউম আপলোড করুন' : 'Click or drag & drop to upload resume'}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          PDF format only (Max 5MB)
        </p>
        <button className="px-4 py-2 rounded-md bg-[#371ee1] hover:bg-[#2e17c4] text-white text-xs font-semibold shadow-xs transition-colors">
          {locale === 'bn' ? 'ফাইল নির্বাচন করুন' : 'Browse Files'}
        </button>
      </div>
    </div>
  );
}

