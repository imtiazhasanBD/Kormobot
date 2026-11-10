'use client';

import { useI18n } from '@/lib/i18n/i18n-context';
import { User, Briefcase, GraduationCap, Code, Sliders, Check } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const { t, locale } = useI18n();
  const [activeTab, setActiveTab] = useState<'personal' | 'experience' | 'education' | 'skills' | 'preferences'>('personal');

  const tabs = [
    { id: 'personal', label: t.profile.personalTab, icon: User },
    { id: 'experience', label: t.profile.experienceTab, icon: Briefcase },
    { id: 'education', label: t.profile.educationTab, icon: GraduationCap },
    { id: 'skills', label: t.profile.skillsTab, icon: Code },
    { id: 'preferences', label: t.profile.preferencesTab, icon: Sliders },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.profile.title}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {locale === 'bn'
              ? 'আপনার জীবনবৃত্তান্ত থেকে এক্সট্র্যাক্ট করা তথ্য পর্যালোচনা ও সম্পাদনা করুন।'
              : 'Review and manage your parsed information used to auto-fill job applications.'}
          </p>
        </div>

        {/* Completeness badge */}
        <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-md border border-[#e5e7eb] shadow-2xs">
          <div className="w-8 h-8 rounded-full border-2 border-[#371ee1] flex items-center justify-center font-bold text-xs text-[#371ee1]">
            75%
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold text-slate-900">{t.profile.completeness}</div>
            <div className="text-[11px] text-slate-500">{locale === 'bn' ? 'প্রায় প্রস্তুত' : 'Nearly ready to auto-apply'}</div>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="bg-white rounded-md border border-[#e5e7eb] shadow-2xs overflow-hidden">
        <div className="flex border-b border-[#e5e7eb] overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  active
                    ? 'border-[#371ee1] text-[#371ee1] bg-[#371ee1]/5'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-[#f8f9fd]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-500">
            {locale === 'bn'
              ? 'রিজিউম আপলোড করার পর প্রোফাইল ফিল্ডগুলো স্বয়ংক্রিয়ভাবে পূর্ণ হবে।'
              : 'Profile fields will be populated automatically when you upload your resume in Chapter 4.'}
          </p>
        </div>
      </div>
    </div>
  );
}

