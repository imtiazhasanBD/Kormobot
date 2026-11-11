'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { UploadCloud, FileText, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ResumeUploadModal } from '@/components/dashboard/resume-upload-modal';

export default function ResumePage() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/users/profile');
      return res.data;
    },
  });

  const resumes = profileData?.user?.resumes || [];

  const handleUploadSuccess = () => {
    setModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['profile'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#371ee1] hover:bg-[#2e17c4] text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{locale === 'bn' ? 'নতুন রিজিউম আপলোড' : 'Upload New Resume'}</span>
        </button>
      </div>

      {/* Upload Box Trigger */}
      <div
        onClick={() => setModalOpen(true)}
        className="border-2 border-dashed border-[#d1d5db] hover:border-[#371ee1] bg-white rounded-md p-10 text-center transition-colors cursor-pointer group shadow-2xs"
      >
        <div className="w-12 h-12 rounded-md bg-[#371ee1]/10 border border-[#371ee1]/20 flex items-center justify-center text-[#371ee1] mx-auto mb-4 group-hover:scale-105 transition-transform">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          {locale === 'bn' ? 'পিডিএফ রিজিউম আপলোড করুন' : 'Click to upload your resume'}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          PDF format only (Max 5MB)
        </p>
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#371ee1] text-white text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{locale === 'bn' ? 'ফাইল নির্বাচন করুন' : 'Browse Files'}</span>
        </span>
      </div>

      {/* Previous Resumes list */}
      <div className="bg-white rounded-md border border-[#e5e7eb] shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e5e7eb]">
          <h3 className="text-sm font-bold text-slate-900">
            {locale === 'bn' ? 'আপলোডকৃত রিজিউম ফাইলসমূহ' : 'Uploaded Resumes'}
          </h3>
        </div>

        <div className="p-6">
          {isLoading ? (
            <p className="text-sm text-slate-500">{t.common.loading}</p>
          ) : resumes.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p>{locale === 'bn' ? 'এখনও কোন রিজিউম আপলোড করা হয়নি।' : 'No resumes uploaded yet.'}</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f1f2f6]">
              {resumes.map((res: any) => (
                <div key={res.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-[#371ee1]/10 text-[#371ee1] flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{res.fileName}</p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{locale === 'bn' ? 'সক্রিয়' : 'Active'}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ResumeUploadModal
        isOpen={modalOpen}
        canClose={true}
        onClose={() => setModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
