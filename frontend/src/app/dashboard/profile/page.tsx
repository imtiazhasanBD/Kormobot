'use client';

import { useMemo, useState } from 'react';
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
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type ProfileTab =
  | 'personal'
  | 'summary'
  | 'experience'
  | 'projects'
  | 'education'
  | 'skills'
  //| 'preferences';

interface ExperienceItem {
  company: string;
  title: string;
  duration: string;
  responsibilities?: string[];
}

interface ProjectItem {
  name: string;
  description: string;
  url: string;
}

interface EducationItem {
  institution: string;
  degree: string;
  year: string;
}

interface ProfileFormData {
  fullName: string;
  phone: string;
  location: string;
  role: string;
  summary: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  links: { linkedin: string; github: string; portfolio?: string };
  preferredLanguage: string;
  discordWebhook: string;
}

const EMPTY_FORM_DATA: ProfileFormData = {
  fullName: '',
  phone: '',
  location: '',
  role: '',
  summary: '',
  skills: [],
  experience: [],
  education: [],
  projects: [],
  links: { linkedin: '', github: '', portfolio: '' },
  preferredLanguage: 'en',
  discordWebhook: '',
};

export default function ProfilePage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [draftFormData, setDraftFormData] = useState<ProfileFormData | null>(null);
  const [newSkill, setNewSkill] = useState('');

  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/users/profile');
      return res.data;
    },
  });

  const serverFormData = useMemo<ProfileFormData>(() => {
    const p = profileResponse?.profile;
    if (!p) return EMPTY_FORM_DATA;
    return {
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
    };
  }, [profileResponse]);

  const formData = draftFormData ?? serverFormData;

  const updateFormData = (updater: (prev: ProfileFormData) => ProfileFormData) => {
    setDraftFormData((prev) => updater(prev ?? serverFormData));
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (updated: ProfileFormData) => {
      const res = await api.put('/users/profile', updated);
      return res.data;
    },
    onSuccess: () => {
      setDraftFormData(null);
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

  const checklist: Array<{
    id: string;
    name: string;
    complete: boolean;
    tab: ProfileTab | 'resume';
  }> = [
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

  const completedCount = checklist.filter((item) => item.complete).length;
  const completeness = Math.round((completedCount / checklist.length) * 100);

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      updateFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    updateFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const addExperience = () => {
    updateFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { company: '', title: '', duration: '', responsibilities: [''] },
      ],
    }));
  };

  const removeExperience = (index: number) => {
    updateFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const addProject = () => {
    updateFormData((prev) => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        { name: '', description: '', url: '' },
      ],
    }));
  };

  const removeProject = (index: number) => {
    updateFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const addEducation = () => {
    updateFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { institution: '', degree: '', year: '' },
      ],
    }));
  };

  const removeEducation = (index: number) => {
    updateFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const tabs: Array<{ id: ProfileTab; label: string; icon: typeof User }> = [
    { id: 'personal', label: t.profile.personalTab, icon: User },
    { id: 'summary', label: t.profile.summaryTab, icon: FileText },
    { id: 'experience', label: t.profile.experienceTab, icon: Briefcase },
    { id: 'projects', label: t.profile.projectsTab, icon: FolderGit2 },
    { id: 'education', label: t.profile.educationTab, icon: GraduationCap },
    { id: 'skills', label: t.profile.skillsTab, icon: Code },
  //  { id: 'preferences', label: t.profile.preferencesTab, icon: Sliders },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-4 h-96" />
          <Skeleton className="lg:col-span-8 h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t.profile.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === 'bn'
              ? 'আপনার জীবনবৃত্তান্ত থেকে এক্সট্র্যাক্ট করা তথ্য পর্যালোচনা ও সম্পাদনা করুন।'
              : 'Review and manage your parsed information used to auto-fill job applications.'}
          </p>
        </div>

        <Button
          type="button"
          onClick={handleSave}
          disabled={updateProfileMutation.isPending}
          className="gap-2 text-xs font-semibold shadow-xs self-start sm:self-auto cursor-pointer"
        >
          {updateProfileMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-4 h-4 text-primary-foreground" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saveSuccess ? 'Saved!' : t.common.save}</span>
        </Button>
      </div>

      {/* Main Grid: Completeness Card (Sidebar) + Tabbed Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Profile Completeness Card */}
        <Card className="lg:col-span-4 p-0 shadow-2xs">
          <CardContent className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground tracking-tight">
                {t.profile.completeness}
              </h3>
              <Badge
                variant="secondary"
                className="rounded-md text-[11px] font-semibold bg-accent text-accent-foreground"
              >
                {completedCount}/{checklist.length}
              </Badge>
            </div>

            {/* Circular Meter + Status Message */}
            <div className="flex items-center gap-4 p-3.5 rounded-md bg-background border border-border">
              <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
                <svg className="w-18 h-18 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-border"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-primary transition-all duration-500 ease-out"
                    strokeDasharray={`${completeness}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-bold text-primary leading-none">
                    {completeness}%
                  </span>
                  <span className="text-[9px] text-muted-foreground font-medium mt-0.5">
                    {locale === 'bn' ? 'সম্পূর্ণ' : 'Complete'}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1 font-bold text-foreground text-sm">
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
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
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

            <Separator />

            {/* Checklist Items */}
            <div className="space-y-1.5">
              {checklist.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    if (item.tab === 'resume') {
                      router.push('/dashboard/resume');
                    } else {
                      setActiveTab(item.tab);
                    }
                  }}
                  className="w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-md hover:bg-background cursor-pointer transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    {item.complete ? (
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-warning shrink-0" />
                    )}
                    <span
                      className={cn(
                        'font-medium',
                        item.complete ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {item.name}
                    </span>
                  </div>

                  {!item.complete ? (
                    <span className="text-[11px] font-semibold text-primary hover:underline">
                      {locale === 'bn' ? 'আপডেট' : 'Update'}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {locale === 'bn' ? 'সম্পন্ন' : 'Done'}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Primary Action Button */}
            {completeness < 100 ? (
              <Button
                type="button"
                onClick={() => {
                  const firstIncomplete = checklist.find((c) => !c.complete);
                  if (firstIncomplete) {
                    if (firstIncomplete.tab === 'resume') {
                      router.push('/dashboard/resume');
                    } else {
                      setActiveTab(firstIncomplete.tab);
                    }
                  }
                }}
                className="w-full h-9 text-xs font-semibold gap-2 cursor-pointer"
              >
                <span>{locale === 'bn' ? 'প্রোফাইল উন্নত করুন' : 'Improve Profile'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/dashboard/jobs')}
                className="w-full h-9 text-xs font-semibold gap-2 bg-accent text-accent-foreground border border-primary/20 cursor-pointer"
              >
                <span>{locale === 'bn' ? 'চাকরি খুঁজুন' : 'Browse Matching Jobs'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Tabbed Editor */}
        <Card className="lg:col-span-8 p-0 shadow-2xs overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as ProfileTab)}
            className="gap-0"
          >
            <TabsList
              variant="line"
              className="group-data-horizontal/tabs:h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex-none h-auto gap-1.5 px-3 py-3 rounded-none text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-background data-active:text-primary data-active:bg-primary/5 after:bg-primary group-data-horizontal/tabs:after:bottom-0 cursor-pointer"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <CardContent className="p-6">
              {/* PERSONAL INFO TAB */}
              <TabsContent value="personal">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-semibold">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        updateFormData((prev) => ({ ...prev, fullName: e.target.value }))
                      }
                      placeholder="e.g. John Doe"
                      className="h-9.5 px-3.5 bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="targetRole" className="text-xs font-semibold">
                      Target Role
                    </Label>
                    <Input
                      id="targetRole"
                      type="text"
                      value={formData.role}
                      onChange={(e) =>
                        updateFormData((prev) => ({ ...prev, role: e.target.value }))
                      }
                      placeholder="e.g. Senior Full-Stack Engineer"
                      className="h-9.5 px-3.5 bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        updateFormData((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="e.g. +1 555-0199 or +880 1700-000000"
                      className="h-9.5 px-3.5 bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="location" className="text-xs font-semibold">
                      Location (City, Country)
                    </Label>
                    <Input
                      id="location"
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        updateFormData((prev) => ({ ...prev, location: e.target.value }))
                      }
                      placeholder="e.g. San Francisco, CA / Dhaka, Bangladesh"
                      className="h-9.5 px-3.5 bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="linkedin" className="text-xs font-semibold">
                      LinkedIn URL
                    </Label>
                    <Input
                      id="linkedin"
                      type="text"
                      value={formData.links?.linkedin || ''}
                      onChange={(e) =>
                        updateFormData((prev) => ({
                          ...prev,
                          links: { ...prev.links, linkedin: e.target.value },
                        }))
                      }
                      placeholder="https://linkedin.com/in/..."
                      className="h-9.5 px-3.5 bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="github" className="text-xs font-semibold">
                      GitHub URL
                    </Label>
                    <Input
                      id="github"
                      type="text"
                      value={formData.links?.github || ''}
                      onChange={(e) =>
                        updateFormData((prev) => ({
                          ...prev,
                          links: { ...prev.links, github: e.target.value },
                        }))
                      }
                      placeholder="https://github.com/..."
                      className="h-9.5 px-3.5 bg-background"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* PROFESSIONAL SUMMARY TAB */}
              <TabsContent value="summary">
                <div className="space-y-4 max-w-3xl">
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-1">
                      {t.profile.summaryTab}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      {locale === 'bn'
                        ? 'আপনার পেশাদার ক্যারিয়ারের মূল অর্জন, প্রযুক্তিগত দক্ষতা এবং লক্ষ্যসমূহ সংক্ষেপে বর্ণনা করুন।'
                        : 'Craft a compelling summary highlighting your key achievements, strengths, and engineering philosophies used in job applications.'}
                    </p>
                    <Textarea
                      rows={8}
                      value={formData.summary}
                      onChange={(e) =>
                        updateFormData((prev) => ({ ...prev, summary: e.target.value }))
                      }
                      placeholder={
                        locale === 'bn'
                          ? 'আপনার পেশাদার অভিজ্ঞতা, প্রজেক্ট এবং দক্ষতার সারসংক্ষেপ এখানে লিখুন...'
                          : 'Full Stack Developer with 3+ years of experience specializing in Next.js, NestJS, and cloud infrastructure...'
                      }
                      className="px-4 py-3 text-sm leading-relaxed bg-background"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formData.summary?.length || 0} characters</span>
                    <span className="text-primary font-medium">Auto-populated from Resume</span>
                  </div>
                </div>
              </TabsContent>

              {/* EXPERIENCE TAB */}
              <TabsContent value="experience">
                <div className="space-y-4 max-w-3xl">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground">Work Experience</h4>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={addExperience}
                      className="gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Position</span>
                    </Button>
                  </div>

                  {formData.experience?.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No work experience entries added.
                    </p>
                  ) : (
                    formData.experience?.map((exp, idx) => (
                      <Card key={idx} className="p-0 bg-background shadow-none">
                        <CardContent className="p-4 space-y-3 relative">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeExperience(idx)}
                            className="absolute top-3 right-3 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            aria-label="Remove position"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-8">
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Company</Label>
                              <Input
                                type="text"
                                value={exp.company || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateFormData((prev) => ({
                                    ...prev,
                                    experience: prev.experience.map((item, i) =>
                                      i === idx ? { ...item, company: val } : item,
                                    ),
                                  }));
                                }}
                                className="h-8 text-xs bg-card"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Job Title</Label>
                              <Input
                                type="text"
                                value={exp.title || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateFormData((prev) => ({
                                    ...prev,
                                    experience: prev.experience.map((item, i) =>
                                      i === idx ? { ...item, title: val } : item,
                                    ),
                                  }));
                                }}
                                className="h-8 text-xs bg-card"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Duration</Label>
                              <Input
                                type="text"
                                value={exp.duration || ''}
                                placeholder="e.g. 2021 - Present"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateFormData((prev) => ({
                                    ...prev,
                                    experience: prev.experience.map((item, i) =>
                                      i === idx ? { ...item, duration: val } : item,
                                    ),
                                  }));
                                }}
                                className="h-8 text-xs bg-card"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* PROJECTS TAB */}
              <TabsContent value="projects">
                <div className="space-y-4 max-w-3xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        {t.profile.projectsTab}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {locale === 'bn'
                          ? 'আপনার পোর্টফোলিও এবং উল্লেখযোগ্য প্রজেক্টসমূহ যোগ করুন।'
                          : 'Showcase your notable builds, open-source work, and live web apps.'}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={addProject}
                      className="gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Project</span>
                    </Button>
                  </div>

                  {!formData.projects || formData.projects.length === 0 ? (
                    <Card className="border border-dashed bg-background shadow-none p-0">
                      <CardContent className="p-8 text-center">
                        <FolderGit2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">No projects added yet.</p>
                        <Button
                          type="button"
                          size="sm"
                          onClick={addProject}
                          className="mt-3 gap-1.5 text-xs font-semibold cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add First Project</span>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    formData.projects.map((proj, idx) => (
                      <Card key={idx} className="p-0 bg-background shadow-none">
                        <CardContent className="p-4 space-y-3 relative">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeProject(idx)}
                            className="absolute top-3 right-3 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            aria-label="Remove project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Project Name</Label>
                              <Input
                                type="text"
                                value={proj.name || ''}
                                placeholder="e.g. ChatFeel or StallForest"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateFormData((prev) => ({
                                    ...prev,
                                    projects: prev.projects.map((item, i) =>
                                      i === idx ? { ...item, name: val } : item,
                                    ),
                                  }));
                                }}
                                className="h-8 text-xs bg-card"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Project URL / GitHub</Label>
                              <div className="relative">
                                <Input
                                  type="text"
                                  value={proj.url || ''}
                                  placeholder="https://github.com/... or https://..."
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateFormData((prev) => ({
                                      ...prev,
                                      projects: prev.projects.map((item, i) =>
                                        i === idx ? { ...item, url: val } : item,
                                      ),
                                    }));
                                  }}
                                  className="h-8 text-xs bg-card pr-8"
                                />
                                {proj.url && (
                                  <a
                                    href={proj.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="absolute right-2.5 top-2 text-muted-foreground hover:text-primary"
                                    aria-label="Open project URL"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <Label className="text-xs font-medium">
                                Description & Technologies
                              </Label>
                              <Textarea
                                rows={2}
                                value={proj.description || ''}
                                placeholder="Short summary of architecture, features, and key stack..."
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateFormData((prev) => ({
                                    ...prev,
                                    projects: prev.projects.map((item, i) =>
                                      i === idx ? { ...item, description: val } : item,
                                    ),
                                  }));
                                }}
                                className="text-xs bg-card"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* EDUCATION TAB */}
              <TabsContent value="education">
                <div className="space-y-4 max-w-3xl">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground">Education</h4>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={addEducation}
                      className="gap-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Degree</span>
                    </Button>
                  </div>

                  {formData.education?.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No education entries added.</p>
                  ) : (
                    formData.education?.map((edu, idx) => (
                      <Card key={idx} className="p-0 bg-background shadow-none">
                        <CardContent className="p-4 space-y-3 relative">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeEducation(idx)}
                            className="absolute top-3 right-3 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            aria-label="Remove degree"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-8">
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Institution</Label>
                              <Input
                                type="text"
                                value={edu.institution || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateFormData((prev) => ({
                                    ...prev,
                                    education: prev.education.map((item, i) =>
                                      i === idx ? { ...item, institution: val } : item,
                                    ),
                                  }));
                                }}
                                className="h-8 text-xs bg-card"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Degree</Label>
                              <Input
                                type="text"
                                value={edu.degree || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateFormData((prev) => ({
                                    ...prev,
                                    education: prev.education.map((item, i) =>
                                      i === idx ? { ...item, degree: val } : item,
                                    ),
                                  }));
                                }}
                                className="h-8 text-xs bg-card"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Year</Label>
                              <Input
                                type="text"
                                value={edu.year || ''}
                                placeholder="e.g. 2018 - 2022"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateFormData((prev) => ({
                                    ...prev,
                                    education: prev.education.map((item, i) =>
                                      i === idx ? { ...item, year: val } : item,
                                    ),
                                  }));
                                }}
                                className="h-8 text-xs bg-card"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* SKILLS TAB */}
              <TabsContent value="skills">
                <div className="space-y-4 max-w-3xl">
                  <h4 className="text-sm font-bold text-foreground">
                    Technical & Professional Skills
                  </h4>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="e.g. TypeScript, React, Next.js, Docker..."
                      className="h-9.5 px-3.5 flex-1 bg-background"
                    />
                    <Button
                      type="button"
                      onClick={addSkill}
                      className="h-9.5 px-4 gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.skills?.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="gap-1.5 px-3 py-1.5 h-auto rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-destructive transition-colors cursor-pointer"
                          aria-label={`Remove ${skill}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* PREFERENCES TAB */}
              <TabsContent value="preferences">
                <div className="space-y-4 max-w-2xl">
                  <div className="space-y-1.5">
                    <Label htmlFor="discordWebhook" className="text-xs font-semibold">
                      Discord Webhook URL (For Real-Time Sales & Application Alerts)
                    </Label>
                    <Input
                      id="discordWebhook"
                      type="text"
                      value={formData.discordWebhook || ''}
                      onChange={(e) =>
                        updateFormData((prev) => ({
                          ...prev,
                          discordWebhook: e.target.value,
                        }))
                      }
                      placeholder="https://discord.com/api/webhooks/..."
                      className="h-9.5 px-3.5 bg-background"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      We post live job application status updates and subscription confirmations to this channel.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
