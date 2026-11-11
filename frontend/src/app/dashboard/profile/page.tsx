'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/i18n-context';
import {
  User,
  FileText,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Code,
  Sliders,
  Check,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'personal' | 'summary' | 'experience' | 'projects' | 'education' | 'skills' | 'preferences'>('personal');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState<any>({
    fullName: '',
    phone: '',
    location: '',
    role: '',
    summary: '',
    skills: [] as string[],
    experience: [] as any[],
    education: [] as any[],
    projects: [] as any[],
    links: { linkedin: '', github: '', portfolio: '' },
    preferredLanguage: 'en',
    discordWebhook: '',
  });

  const [newSkill, setNewSkill] = useState('');

  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/users/profile');
      return res.data;
    },
  });

  useEffect(() => {
    if (profileResponse?.profile) {
      const p = profileResponse.profile;
      setFormData({
        fullName: p.fullName || '',
        phone: p.phone || '',
        location: p.location || '',
        role: p.role || '',
        summary: p.summary || '',
        skills: p.skills || [],
        experience: p.experience || [],
        education: p.education || [],
        projects: p.projects || [],
        links: p.links || { linkedin: '', github: '', portfolio: '' },
        preferredLanguage: p.preferredLanguage || 'en',
        discordWebhook: p.discordWebhook || '',
      });
    }
  }, [profileResponse]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updated: any) => {
      const res = await api.put('/users/profile', updated);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const hasResume =
    (profileResponse?.user?.resumes && profileResponse.user.resumes.length > 0) || false;

  const checklist = [
    {
      id: 'personal',
      name: locale === 'bn' ? 'মৌলিক তথ্য' : 'Basic Information',
      complete: !!(formData.fullName && formData.phone && formData.location),
      tab: 'personal',
    },
    {
      id: 'summary',
      name: locale === 'bn' ? 'পেশাদার সারসংক্ষেপ' : 'Summary',
      complete: !!(formData.summary && formData.summary.trim().length > 10),
      tab: 'summary',
    },
    {
      id: 'experience',
      name: locale === 'bn' ? 'কাজের অভিজ্ঞতা' : 'Work Experience',
      complete: !!(formData.experience && formData.experience.length > 0),
      tab: 'experience',
    },
    {
      id: 'projects',
      name: locale === 'bn' ? 'প্রজেক্টসমূহ' : 'Projects',
      complete: !!(formData.projects && formData.projects.length > 0),
      tab: 'projects',
    },
    {
      id: 'education',
      name: locale === 'bn' ? 'শিক্ষাগত যোগ্যতা' : 'Education',
      complete: !!(formData.education && formData.education.length > 0),
      tab: 'education',
    },
    {
      id: 'skills',
      name: locale === 'bn' ? 'দক্ষতা সমূহ' : 'Skills',
      complete: !!(formData.skills && formData.skills.length > 0),
      tab: 'skills',
    },
    {
      id: 'resume',
      name: locale === 'bn' ? 'রিজিউম' : 'Resume',
      complete: hasResume,
      tab: 'resume',
    },
  ];

  const calculateCompleteness = () => {
    const total = checklist.length;
    const completed = checklist.filter((item) => item.complete).length;
    return Math.round((completed / total) * 100);
  };

  const completeness = calculateCompleteness();

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s: string) => s !== skillToRemove),
    });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        { company: '', title: '', duration: '', responsibilities: [''] },
      ],
    });
  };

  const removeExperience = (index: number) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter((_: any, i: number) => i !== index),
    });
  };

  const addProject = () => {
    setFormData({
      ...formData,
      projects: [
        ...(formData.projects || []),
        { name: '', description: '', url: '' },
      ],
    });
  };

  const removeProject = (index: number) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((_: any, i: number) => i !== index),
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        { institution: '', degree: '', year: '' },
      ],
    });
  };

  const removeEducation = (index: number) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_: any, i: number) => i !== index),
    });
  };

  const tabs = [
    { id: 'personal', label: t.profile.personalTab, icon: User },
    { id: 'summary', label: t.profile.summaryTab, icon: FileText },
    { id: 'experience', label: t.profile.experienceTab, icon: Briefcase },
    { id: 'projects', label: t.profile.projectsTab, icon: FolderGit2 },
    { id: 'education', label: t.profile.educationTab, icon: GraduationCap },
    { id: 'skills', label: t.profile.skillsTab, icon: Code },
    { id: 'preferences', label: t.profile.preferencesTab, icon: Sliders },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-[#371ee1]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
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

        <button
          onClick={handleSave}
          disabled={updateProfileMutation.isPending}
          className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#371ee1] hover:bg-[#2e17c4] text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          {updateProfileMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-4 h-4 text-emerald-300" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saveSuccess ? 'Saved!' : t.common.save}</span>
        </button>
      </div>

      {/* Main Grid: Completeness Card (Sidebar) + Tabbed Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Profile Completeness Card */}
        <div className="lg:col-span-4 bg-white rounded-md border border-[#e2e5f1] p-5 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {t.profile.completeness}
            </h3>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#eef0fe] text-[#371ee1]">
              {checklist.filter((c) => c.complete).length}/{checklist.length}
            </span>
          </div>

          {/* Circular Meter + Status Message */}
          <div className="flex items-center gap-4 p-3.5 rounded-md bg-[#f8f9fd] border border-[#e2e5f1]">
            <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
              <svg className="w-18 h-18 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#e2e5f1]"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#371ee1] transition-all duration-500 ease-out"
                  strokeDasharray={`${completeness}, 100`}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-sm font-bold text-[#371ee1] leading-none">
                  {completeness}%
                </span>
                <span className="text-[9px] text-slate-500 font-medium mt-0.5">
                  {locale === 'bn' ? 'সম্পূর্ণ' : 'Complete'}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1 font-bold text-slate-900 text-sm">
                <span>
                  {completeness >= 80
                    ? locale === 'bn'
                      ? 'দারুণ হয়েছে!'
                      : 'Great job!'
                    : locale === 'bn'
                    ? 'প্রায় প্রস্তুত!'
                    : 'Getting close!'}
                </span>
                <span>{completeness >= 80 ? '🎉' : '✨'}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                {completeness >= 80
                  ? locale === 'bn'
                    ? 'আপনার প্রোফাইল বেশ শক্তিশালী।'
                    : 'Your profile is ready for AI auto-apply.'
                  : locale === 'bn'
                  ? 'সবগুলো ধাপ সম্পূর্ণ করুন।'
                  : 'Complete missing sections for better matches.'}
              </p>
            </div>
          </div>

          <div className="h-px bg-[#e2e5f1]" />

          {/* Checklist Items */}
          <div className="space-y-2.5">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.tab === 'resume') {
                    router.push('/dashboard/resume');
                  } else {
                    setActiveTab(item.tab as any);
                  }
                }}
                className="flex items-center justify-between text-xs py-1 px-2 -mx-2 rounded-md hover:bg-[#f8f9fd] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {item.complete ? (
                    <CheckCircle2 className="w-4 h-4 text-[#371ee1] shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span
                    className={`font-medium ${
                      item.complete ? 'text-slate-800' : 'text-slate-500'
                    }`}
                  >
                    {item.name}
                  </span>
                </div>

                {!item.complete ? (
                  <span className="text-[11px] font-semibold text-[#371ee1] hover:underline">
                    {locale === 'bn' ? 'আপডেট' : 'Update'}
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400">
                    {locale === 'bn' ? 'সম্পন্ন' : 'Done'}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Primary Action Button */}
          {completeness < 100 ? (
            <button
              onClick={() => {
                const firstIncomplete = checklist.find((c) => !c.complete);
                if (firstIncomplete) {
                  if (firstIncomplete.tab === 'resume') {
                    router.push('/dashboard/resume');
                  } else {
                    setActiveTab(firstIncomplete.tab as any);
                  }
                }
              }}
              className="w-full py-2.5 px-4 rounded-md bg-[#371ee1] hover:bg-[#2e17c4] text-white text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <span>{locale === 'bn' ? 'প্রোফাইল উন্নত করুন' : 'Improve Profile'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => router.push('/dashboard/jobs')}
              className="w-full py-2.5 px-4 rounded-md bg-[#eef0fe] hover:bg-[#e2e5f1] text-[#371ee1] text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-[#371ee1]/20"
            >
              <span>{locale === 'bn' ? 'চাকরি খুঁজুন' : 'Browse Matching Jobs'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right Column: Tabbed Editor */}
        <div className="lg:col-span-8 bg-white rounded-md border border-[#e2e5f1] shadow-2xs overflow-hidden">
          <div className="flex border-b border-[#e5e7eb] overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
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
          {/* PERSONAL INFO TAB */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2 text-sm rounded-md border border-[#e5e7eb] focus:outline-hidden focus:border-[#371ee1] focus:ring-1 focus:ring-[#371ee1]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Role
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="w-full px-3.5 py-2 text-sm rounded-md border border-[#e5e7eb] focus:outline-hidden focus:border-[#371ee1] focus:ring-1 focus:ring-[#371ee1]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +1 555-0199 or +880 1700-000000"
                  className="w-full px-3.5 py-2 text-sm rounded-md border border-[#e5e7eb] focus:outline-hidden focus:border-[#371ee1] focus:ring-1 focus:ring-[#371ee1]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location (City, Country)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA / Dhaka, Bangladesh"
                  className="w-full px-3.5 py-2 text-sm rounded-md border border-[#e5e7eb] focus:outline-hidden focus:border-[#371ee1] focus:ring-1 focus:ring-[#371ee1]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="text"
                  value={formData.links?.linkedin || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      links: { ...formData.links, linkedin: e.target.value },
                    })
                  }
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3.5 py-2 text-sm rounded-md border border-[#e5e7eb] focus:outline-hidden focus:border-[#371ee1] focus:ring-1 focus:ring-[#371ee1]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GitHub URL
                </label>
                <input
                  type="text"
                  value={formData.links?.github || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      links: { ...formData.links, github: e.target.value },
                    })
                  }
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2 text-sm rounded-md border border-[#e5e7eb] focus:outline-hidden focus:border-[#371ee1] focus:ring-1 focus:ring-[#371ee1]"
                />
              </div>
            </div>
          )}

          {/* PROFESSIONAL SUMMARY TAB */}
          {activeTab === 'summary' && (
            <div className="space-y-4 max-w-3xl">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  {t.profile.summaryTab}
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  {locale === 'bn'
                    ? 'আপনার পেশাদার ক্যারিয়ারের মূল অর্জন, প্রযুক্তিগত দক্ষতা এবং লক্ষ্যসমূহ সংক্ষেপে বর্ণনা করুন।'
                    : 'Craft a compelling summary highlighting your key achievements, strengths, and engineering philosophies used in job applications.'}
                </p>
                <textarea
                  rows={8}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder={
                    locale === 'bn'
                      ? 'আপনার পেশাদার অভিজ্ঞতা, প্রজেক্ট এবং দক্ষতার সারসংক্ষেপ এখানে লিখুন...'
                      : 'Full Stack Developer with 3+ years of experience specializing in Next.js, NestJS, and cloud infrastructure...'
                  }
                  className="w-full px-4 py-3 text-sm rounded-md border border-[#e5e7eb] focus:outline-hidden focus:border-[#371ee1] focus:ring-1 focus:ring-[#371ee1] leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{formData.summary?.length || 0} characters</span>
                <span className="text-[#371ee1] font-medium">Auto-populated from Resume</span>
              </div>
            </div>
          )}

          {/* EXPERIENCE TAB */}
          {activeTab === 'experience' && (
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Work Experience</h4>
                <button
                  onClick={addExperience}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#371ee1]/10 text-[#371ee1] text-xs font-semibold hover:bg-[#371ee1]/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Position</span>
                </button>
              </div>

              {formData.experience?.length === 0 ? (
                <p className="text-xs text-slate-400">No work experience entries added.</p>
              ) : (
                formData.experience?.map((exp: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-md border border-[#e5e7eb] bg-[#f8f9fd] space-y-3 relative">
                    <button
                      onClick={() => removeExperience(idx)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company || ''}
                          onChange={(e) => {
                            const newExp = [...formData.experience];
                            newExp[idx].company = e.target.value;
                            setFormData({ ...formData, experience: newExp });
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#e5e7eb] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Job Title</label>
                        <input
                          type="text"
                          value={exp.title || ''}
                          onChange={(e) => {
                            const newExp = [...formData.experience];
                            newExp[idx].title = e.target.value;
                            setFormData({ ...formData, experience: newExp });
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#e5e7eb] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Duration</label>
                        <input
                          type="text"
                          value={exp.duration || ''}
                          placeholder="e.g. 2021 - Present"
                          onChange={(e) => {
                            const newExp = [...formData.experience];
                            newExp[idx].duration = e.target.value;
                            setFormData({ ...formData, experience: newExp });
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#e5e7eb] bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.profile.projectsTab}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {locale === 'bn'
                      ? 'আপনার পোর্টফোলিও এবং উল্লেখযোগ্য প্রজেক্টসমূহ যোগ করুন।'
                      : 'Showcase your notable builds, open-source work, and live web apps.'}
                  </p>
                </div>
                <button
                  onClick={addProject}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#371ee1]/10 text-[#371ee1] text-xs font-semibold hover:bg-[#371ee1]/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              {(!formData.projects || formData.projects.length === 0) ? (
                <div className="p-8 text-center rounded-md border border-dashed border-[#e5e7eb] bg-[#f8f9fd]">
                  <FolderGit2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No projects added yet.</p>
                  <button
                    onClick={addProject}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#371ee1] text-white text-xs font-semibold shadow-xs hover:bg-[#2e17c4] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Project</span>
                  </button>
                </div>
              ) : (
                formData.projects.map((proj: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-md border border-[#e5e7eb] bg-[#f8f9fd] space-y-3 relative">
                    <button
                      onClick={() => removeProject(idx)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Project Name</label>
                        <input
                          type="text"
                          value={proj.name || ''}
                          placeholder="e.g. ChatFeel or StallForest"
                          onChange={(e) => {
                            const newProjects = [...formData.projects];
                            newProjects[idx].name = e.target.value;
                            setFormData({ ...formData, projects: newProjects });
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#e5e7eb] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Project URL / GitHub</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={proj.url || ''}
                            placeholder="https://github.com/... or https://..."
                            onChange={(e) => {
                              const newProjects = [...formData.projects];
                              newProjects[idx].url = e.target.value;
                              setFormData({ ...formData, projects: newProjects });
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded-md border border-[#e5e7eb] bg-white pr-8"
                          />
                          {proj.url && (
                            <a
                              href={proj.url}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute right-2.5 top-2 text-slate-400 hover:text-[#371ee1]"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">Description & Technologies</label>
                        <textarea
                          rows={2}
                          value={proj.description || ''}
                          placeholder="Short summary of architecture, features, and key stack..."
                          onChange={(e) => {
                            const newProjects = [...formData.projects];
                            newProjects[idx].description = e.target.value;
                            setFormData({ ...formData, projects: newProjects });
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#e5e7eb] bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* EDUCATION TAB */}
          {activeTab === 'education' && (
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Education</h4>
                <button
                  onClick={addEducation}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#371ee1]/10 text-[#371ee1] text-xs font-semibold hover:bg-[#371ee1]/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Degree</span>
                </button>
              </div>

              {formData.education?.length === 0 ? (
                <p className="text-xs text-slate-400">No education entries added.</p>
              ) : (
                formData.education?.map((edu: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-md border border-[#e5e7eb] bg-[#f8f9fd] space-y-3 relative">
                    <button
                      onClick={() => removeEducation(idx)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Institution</label>
                        <input
                          type="text"
                          value={edu.institution || ''}
                          onChange={(e) => {
                            const newEdu = [...formData.education];
                            newEdu[idx].institution = e.target.value;
                            setFormData({ ...formData, education: newEdu });
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#e5e7eb] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Degree</label>
                        <input
                          type="text"
                          value={edu.degree || ''}
                          onChange={(e) => {
                            const newEdu = [...formData.education];
                            newEdu[idx].degree = e.target.value;
                            setFormData({ ...formData, education: newEdu });
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#e5e7eb] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Year</label>
                        <input
                          type="text"
                          value={edu.year || ''}
                          placeholder="e.g. 2018 - 2022"
                          onChange={(e) => {
                            const newEdu = [...formData.education];
                            newEdu[idx].year = e.target.value;
                            setFormData({ ...formData, education: newEdu });
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded-md border border-[#e5e7eb] bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SKILLS TAB */}
          {activeTab === 'skills' && (
            <div className="space-y-4 max-w-3xl">
              <h4 className="text-sm font-bold text-slate-900">Technical & Professional Skills</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="e.g. TypeScript, React, Next.js, Docker..."
                  className="flex-1 px-3.5 py-2 text-sm rounded-md border border-[#e5e7eb] focus:outline-hidden focus:border-[#371ee1] focus:ring-1 focus:ring-[#371ee1]"
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-2 rounded-md bg-[#371ee1] hover:bg-[#2e17c4] text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {formData.skills?.map((skill: string) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#371ee1]/10 text-[#371ee1] border border-[#371ee1]/20"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => removeSkill(skill)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Discord Webhook URL (For Real-Time Sales & Application Alerts)
                </label>
                <input
                  type="text"
                  value={formData.discordWebhook || ''}
                  onChange={(e) => setFormData({ ...formData, discordWebhook: e.target.value })}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full px-3.5 py-2 text-sm rounded-md border border-[#e5e7eb] focus:outline-hidden focus:border-[#371ee1] focus:ring-1 focus:ring-[#371ee1]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  We post live job application status updates and subscription confirmations to this channel.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
