'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { JobCard, JobItem } from '@/components/dashboard/job-card';

export default function SavedJobsPage() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [savingJobId, setSavingJobId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: async () => {
      const res = await api.get('/jobs/saved');
      return res.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (jobId: string) => {
      setSavingJobId(jobId);
      const res = await api.patch(`/jobs/${jobId}/save`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onSettled: () => {
      setSavingJobId(null);
    },
  });

  const savedJobs: JobItem[] = data?.jobs || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {t.nav.savedJobs}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {locale === 'bn'
            ? 'আপনার সংরক্ষিত চাকরির তালিকা। এখান থেকে সরাসরি আবেদন করুন।'
            : 'Track bookmarked jobs and apply whenever you are ready.'}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-md border border-[#e2e5f1] p-5 h-36 animate-pulse"
            />
          ))}
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="bg-white rounded-md border border-[#e2e5f1] p-10 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-md bg-[#eef0fe] border border-[#371ee1]/20 flex items-center justify-center text-[#371ee1] mx-auto mb-3">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {locale === 'bn' ? 'কোন সংরক্ষিত চাকরি নেই' : 'No saved jobs yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            {locale === 'bn'
              ? 'চাকরি খোঁজার পৃষ্ঠা থেকে বুকমার্ক আইকনে ক্লিক করে চাকরি সংরক্ষণ করুন।'
              : 'Bookmark jobs from the Jobs discovery page to review and apply later.'}
          </p>
          <Link
            href="/dashboard/jobs"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#371ee1] hover:bg-[#2e17c4] text-white text-xs font-semibold transition-colors"
          >
            <span>Browse Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onToggleSave={(id) => saveMutation.mutate(id)}
              isSaving={savingJobId === job.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
