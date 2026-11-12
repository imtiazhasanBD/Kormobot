'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n/i18n-context';
import {
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  Bookmark,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export interface JobItem {
  id: string;
  platform: string;
  title: string;
  company: string;
  companyLogo?: string | null;
  location?: string | null;
  salary?: string | null;
  jobType?: string | null;
  experienceLevel?: string | null;
  description?: string | null;
  tags?: string[] | null;
  matchScore?: number | null;
  jobUrl: string;
  appliedStatus: string;
  savedStatus: boolean;
  fetchedAt?: string;
}

interface JobCardProps {
  job: JobItem;
  onToggleSave: (jobId: string) => void;
  isSaving?: boolean;
  onApplyWithAi?: (job: JobItem) => void;
}

const PLATFORM_LABELS: Record<string, { name: string; badgeClass: string }> = {
  greenhouse: {
    name: 'Greenhouse',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  lever: {
    name: 'Lever',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  workable: {
    name: 'Workable',
    badgeClass: 'bg-violet-50 text-[#371ee1] border-[#371ee1]/20',
  },
  wellfound: {
    name: 'Wellfound',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  linkedin: {
    name: 'LinkedIn',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  alljobs: {
    name: 'AllJobs (BD)',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  bdjobs: {
    name: 'BDJobs',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export function JobCard({
  job,
  onToggleSave,
  isSaving = false,
  onApplyWithAi,
}: JobCardProps) {
  const { t, locale } = useI18n();
  const [logoError, setLogoError] = useState(false);

  const platformMeta = PLATFORM_LABELS[job.platform.toLowerCase()] || {
    name: job.platform,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const matchScore = job.matchScore ?? 72;
  const tags = Array.isArray(job.tags) ? job.tags : [];
  const companyInitials = (job.company || 'CO')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="bg-white rounded-md border border-[#e2e5f1] hover:border-[#371ee1]/40 p-5 shadow-2xs transition-all space-y-4">
      {/* Top Row: Company Logo, Title, Company & Match Score */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className={`w-11 h-11 rounded-md border flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden ${
              job.companyLogo && !logoError
                ? 'bg-white border-[#e2e5f1]'
                : 'bg-[#eef0fe] border-[#371ee1]/15 text-[#371ee1]'
            }`}
          >
            {job.companyLogo && !logoError ? (
              <img
                src={job.companyLogo}
                alt={job.company}
                onError={() => setLogoError(true)}
                className="w-8 h-8 object-contain"
              />
            ) : (
              companyInitials
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {job.title}
              </h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${platformMeta.badgeClass}`}
              >
                {platformMeta.name}
              </span>

              {job.appliedStatus && job.appliedStatus !== 'none' && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                    job.appliedStatus === 'submitted'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : job.appliedStatus === 'failed'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {job.appliedStatus === 'submitted' ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  <span className="capitalize">{job.appliedStatus.replace('_', ' ')}</span>
                </span>
              )}
            </div>

            <p className="text-sm font-medium text-slate-600 mt-0.5">
              {job.company}
            </p>
          </div>
        </div>

        {/* Match Score Meter */}
        <div className="sm:w-36 shrink-0 bg-[#f8f9fd] border border-[#e2e5f1] rounded-md p-2.5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-500">{t.jobs.matchScore}</span>
            <span className="font-bold text-[#371ee1]">{matchScore}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#e2e5f1] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#371ee1] rounded-full transition-all duration-500"
              style={{ width: `${matchScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metadata Row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
        {job.location && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.location}</span>
          </span>
        )}
        {job.jobType && (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.jobType}</span>
          </span>
        )}
        {job.experienceLevel && (
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.experienceLevel}</span>
          </span>
        )}
        {job.salary && (
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
            <DollarSign className="w-3.5 h-3.5 text-[#371ee1]" />
            <span>{job.salary}</span>
          </span>
        )}
      </div>

      {/* Description */}
      {job.description && (
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
          {job.description}
        </p>
      )}

      {/* Tags & Actions */}
      <div className="pt-2 border-t border-[#f1f2f6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#f8f9fd] text-slate-700 border border-[#e2e5f1]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onToggleSave(job.id)}
            disabled={isSaving}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold border transition-colors ${
              job.savedStatus
                ? 'bg-[#eef0fe] text-[#371ee1] border-[#371ee1]/30'
                : 'bg-white text-slate-700 border-[#e2e5f1] hover:bg-[#f8f9fd]'
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Bookmark
                className={`w-3.5 h-3.5 ${
                  job.savedStatus ? 'fill-[#371ee1] text-[#371ee1]' : 'text-slate-500'
                }`}
              />
            )}
            <span>{job.savedStatus ? t.jobs.saved : t.jobs.saveForLater}</span>
          </button>

          {onApplyWithAi && job.platform !== 'alljobs' && job.platform !== 'bdjobs' && (
            <button
              onClick={() => onApplyWithAi(job)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#eef0fe] hover:bg-[#e2e5f1] text-[#371ee1] text-xs font-semibold border border-[#371ee1]/20 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.jobs.applyAutomatically}</span>
            </button>
          )}

          <a
            href={job.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#371ee1] hover:bg-[#2e17c4] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <span>{locale === 'bn' ? 'আবেদন করুন' : t.jobs.applyNow}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

