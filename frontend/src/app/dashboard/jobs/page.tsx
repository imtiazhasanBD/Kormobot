'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  MapPin,
  Sparkles,
  Building2,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Layers,
  Clock,
} from 'lucide-react';
import api from '@/lib/api';
import { JobCard, JobItem } from '@/components/dashboard/job-card';

type PlatformFilter = 'all' | 'greenhouse' | 'lever' | 'workable' | 'wellfound' | 'linkedin';

export default function JobsPage() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformFilter>('all');
  const [page, setPage] = useState(1);
  const [forceRefreshFlag, setForceRefreshFlag] = useState(false);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/users/profile');
      return res.data;
    },
  });

  const {
    data: jobsData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['jobs', selectedPlatform, appliedQuery, locationFilter, jobTypeFilter, page, forceRefreshFlag],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        platform: selectedPlatform,
        page,
        limit: 15,
      };
      if (appliedQuery) params.q = appliedQuery;
      if (locationFilter) params.location = locationFilter;
      if (jobTypeFilter !== 'all') params.jobType = jobTypeFilter;
      if (forceRefreshFlag) {
        params.refresh = 'true';
        setForceRefreshFlag(false);
      }
      const res = await api.get('/jobs', { params });
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
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
    onSettled: () => {
      setSavingJobId(null);
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedQuery(searchInput);
    setForceRefreshFlag(true);
  };

  const handleRefreshLive = () => {
    setPage(1);
    setForceRefreshFlag(true);
    refetch();
  };

  const profile = profileData?.profile;
  const hasResume = (profileData?.user?.resumes?.length || 0) > 0;
  const completenessParts = [
    !!(profile?.fullName && profile?.phone && profile?.location),
    !!(profile?.summary && profile.summary.trim().length > 10),
    !!(profile?.experience && profile.experience.length > 0),
    !!(profile?.projects && profile.projects.length > 0),
    !!(profile?.education && profile.education.length > 0),
    !!(profile?.skills && profile.skills.length > 0),
    hasResume,
  ];
  const completeness = Math.round(
    (completenessParts.filter(Boolean).length / completenessParts.length) * 100,
  );

  const jobs: JobItem[] = jobsData?.jobs || [];
  const platformCounts = jobsData?.platformCounts || {};
  const totalSavedCount = jobs.filter((j) => j.savedStatus).length;

  const platforms: Array<{ id: PlatformFilter; label: string; domain: string; count: number }> = [
    {
      id: 'all',
      label: locale === 'bn' ? 'সব প্ল্যাটফর্ম' : 'All Platforms',
      domain: 'Combined Feed',
      count:
        (platformCounts.greenhouse || 0) +
        (platformCounts.lever || 0) +
        (platformCounts.workable || 0) +
        (platformCounts.wellfound || 0) +
        (platformCounts.linkedin || 0),
    },
    {
      id: 'greenhouse',
      label: 'Greenhouse',
      domain: 'boards.greenhouse.io',
      count: platformCounts.greenhouse || 0,
    },
    {
      id: 'lever',
      label: 'Lever',
      domain: 'jobs.lever.co',
      count: platformCounts.lever || 0,
    },
    {
      id: 'workable',
      label: 'Workable',
      domain: 'apply.workable.com',
      count: platformCounts.workable || 0,
    },
    {
      id: 'wellfound',
      label: 'Wellfound',
      domain: 'wellfound.com',
      count: platformCounts.wellfound || 0,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      domain: 'linkedin.com/jobs',
      count: platformCounts.linkedin || 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-md border border-[#e2e5f1] p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#eef0fe] text-[#371ee1] text-[11px] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {jobsData?.provider
                ? `Powered by ${jobsData.provider.toUpperCase()} Search`
                : 'AI Job Discovery'}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.jobs.title}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {profile?.role
              ? locale === 'bn'
                ? `আপনার প্রোফাইল (${profile.role}) অনুযায়ী ম্যাচিং চাকরি খোঁজা হয়েছে।`
                : `Tailored matches for ${profile.role} using your parsed skills & profile.`
              : t.jobs.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {jobsData?.lastSyncedAt && (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-[#f8f9fd] px-3 py-2 rounded-md border border-[#e2e5f1]">
              <Clock className="w-3.5 h-3.5 text-[#371ee1]" />
              <span>
                {jobsData.cacheHit ? 'Cached · ' : 'Live · '}
                {new Date(jobsData.lastSyncedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </span>
          )}

          <button
            onClick={handleRefreshLive}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#371ee1] hover:bg-[#2e17c4] disabled:opacity-60 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{locale === 'bn' ? 'লাইভ রিফ্রেশ' : 'Fetch Live Jobs'}</span>
          </button>
        </div>
      </div>

      {/* Selectable Platform Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {platforms.map((p) => {
          const active = selectedPlatform === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPlatform(p.id);
                setPage(1);
              }}
              className={`text-left p-3.5 rounded-md border transition-all ${
                active
                  ? 'bg-[#371ee1] border-[#371ee1] text-white shadow-xs'
                  : 'bg-white border-[#e2e5f1] hover:border-[#371ee1]/40 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold truncate">{p.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                    active
                      ? 'bg-white/20 text-white'
                      : 'bg-[#eef0fe] text-[#371ee1]'
                  }`}
                >
                  {p.count}
                </span>
              </div>
              <p
                className={`text-[11px] truncate ${
                  active ? 'text-white/80' : 'text-slate-400'
                }`}
              >
                {p.domain}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white p-4 rounded-md border border-[#e2e5f1] shadow-2xs"
      >
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.jobs.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-md border border-[#e2e5f1] focus:outline-hidden focus:border-[#371ee1] focus:ring-1 focus:ring-[#371ee1] placeholder:text-slate-400"
            />
          </div>

          <div className="relative md:w-48">
            <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder={locale === 'bn' ? 'অবস্থান / রিমোট' : 'Location (e.g. Remote)'}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-[#e2e5f1] focus:outline-hidden focus:border-[#371ee1] focus:ring-1 focus:ring-[#371ee1] placeholder:text-slate-400"
            />
          </div>

          <select
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-md border border-[#e2e5f1] bg-white text-slate-700 focus:outline-hidden focus:border-[#371ee1]"
          >
            <option value="all">{locale === 'bn' ? 'সব ধরন' : 'All Job Types'}</option>
            <option value="Remote">Remote</option>
            <option value="Full-time">Full-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>

          <button
            type="submit"
            disabled={isFetching}
            className="px-5 py-2 rounded-md bg-[#371ee1] hover:bg-[#2e17c4] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>{locale === 'bn' ? 'অনুসন্ধান' : 'Search Jobs'}</span>
          </button>
        </div>
      </form>

      {/* Main Content + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Main: Job Matches List */}
        <div className="lg:col-span-8 space-y-4">
          {jobsData?.searchError && (
            <div className="p-3.5 rounded-md bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-amber-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Live search warning: {jobsData.searchError}</span>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-md border border-[#e2e5f1] p-5 space-y-3 animate-pulse"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-md bg-slate-200" />
                      <div className="space-y-2">
                        <div className="h-4 w-56 bg-slate-200 rounded-md" />
                        <div className="h-3 w-32 bg-slate-100 rounded-md" />
                      </div>
                    </div>
                    <div className="h-10 w-32 bg-slate-100 rounded-md" />
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-md" />
                  <div className="h-3 w-2/3 bg-slate-100 rounded-md" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="bg-white rounded-md border border-red-200 p-8 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-900">
                Failed to load jobs
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                {(error as any)?.message || 'Please check your backend server and API keys.'}
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 rounded-md bg-[#371ee1] text-white text-xs font-semibold"
              >
                Try Again
              </button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-md border border-[#e2e5f1] p-10 text-center shadow-2xs">
              <div className="w-12 h-12 rounded-md bg-[#eef0fe] border border-[#371ee1]/20 flex items-center justify-center text-[#371ee1] mx-auto mb-3">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {locale === 'bn' ? 'কোন চাকরি পাওয়া যায়নি' : 'No matching jobs found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                {locale === 'bn'
                  ? 'ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন অথবা লাইভ অনুসন্ধান চালান।'
                  : 'Try adjusting your filters or fetch fresh listings from Greenhouse, Lever, Workable, and Wellfound.'}
              </p>
              <button
                onClick={handleRefreshLive}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#371ee1] hover:bg-[#2e17c4] text-white text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>{locale === 'bn' ? 'লাইভ চাকরি খুঁজুন' : 'Fetch Live Jobs'}</span>
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onToggleSave={(id) => saveMutation.mutate(id)}
                    isSaving={savingJobId === job.id}
                  />
                ))}
              </div>

              {/* Pagination */}
              {jobsData?.pagination && jobsData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3.5 py-2 rounded-md border border-[#e2e5f1] bg-white text-xs font-semibold text-slate-700 disabled:opacity-50 hover:bg-[#f8f9fd]"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-500">
                    Page {jobsData.pagination.page} of {jobsData.pagination.totalPages}
                  </span>
                  <button
                    disabled={page >= jobsData.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3.5 py-2 rounded-md border border-[#e2e5f1] bg-white text-xs font-semibold text-slate-700 disabled:opacity-50 hover:bg-[#f8f9fd]"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Sidebar: Profile Completeness + Recent Activity */}
        <div className="lg:col-span-4 space-y-5">
          {/* Compact Profile Completeness Widget */}
          <div className="bg-white rounded-md border border-[#e2e5f1] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {t.profile.completeness}
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#eef0fe] text-[#371ee1]">
                {completeness}%
              </span>
            </div>

            <div className="w-full h-2 bg-[#f1f2fa] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#371ee1] rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {completeness >= 80
                ? 'Your profile and resume are strong and ready for high-accuracy job matching.'
                : 'Complete your profile sections to boost your match score and auto-apply accuracy.'}
            </p>

            <Link
              href="/dashboard/profile"
              className="w-full py-2 px-3 rounded-md bg-[#eef0fe] hover:bg-[#e2e5f1] text-[#371ee1] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-[#371ee1]/20"
            >
              <span>{completeness >= 100 ? 'View Profile' : 'Update Profile'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-md border border-[#e2e5f1] p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {locale === 'bn' ? 'সাম্প্রতিক কার্যক্রম' : 'Recent Activity'}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-md bg-[#f8f9fd] border border-[#e2e5f1]">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <Layers className="w-4 h-4 text-[#371ee1]" />
                  <span>Jobs Matched</span>
                </span>
                <span className="font-bold text-slate-900">
                  {jobsData?.pagination?.total || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-md bg-[#f8f9fd] border border-[#e2e5f1]">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <Bookmark className="w-4 h-4 text-[#371ee1]" />
                  <span>Saved on Page</span>
                </span>
                <span className="font-bold text-slate-900">{totalSavedCount}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-md bg-[#f8f9fd] border border-[#e2e5f1]">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#371ee1]" />
                  <span>Active Search Engine</span>
                </span>
                <span className="font-semibold text-[#371ee1] uppercase">
                  {jobsData?.provider || 'tavily'}
                </span>
              </div>
            </div>

            <Link
              href="/dashboard/saved-jobs"
              className="block text-center text-xs font-semibold text-[#371ee1] hover:underline pt-1"
            >
              View All Saved Jobs →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
