'use client';

import { useState } from 'react';
import {
  Briefcase,
  Building2,
  Check,
  Cpu,
  Globe,
  Landmark,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

interface ShowcaseItem {
  id: string;
  tabLabel: string;
  tabLabelBn: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  bullets: string[];
  bulletsBn: string[];
  domain: string;
  badgeText: string;
  previewRole: string;
  previewCompany: string;
  previewMeta: string;
  previewScore: string;
  previewSecondaryRole: string;
  previewSecondaryMeta: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: 'ats',
    tabLabel: 'Global Tech & ATS',
    tabLabelBn: 'গ্লোবাল টেক ও এ.টি.এস',
    title: 'Global ATS Boards',
    titleBn: 'গ্লোবাল এ.টি.এস জব বোর্ড',
    description:
      'Direct discovery across Greenhouse, Lever, Workable, and Wellfound with structured role matching and 6-hour smart caching.',
    descriptionBn:
      'Greenhouse, Lever, Workable ও Wellfound থেকে সরাসরি রিমোট ও টেক চাকরি খুঁজে স্মার্ট ম্যাচ স্কোর সহ দেখায়।',
    bullets: [
      'Direct ATS board indexing without aggregators',
      'Company logo & role stack extraction',
      'Autonomous Playwright auto-fill support',
    ],
    bulletsBn: [
      'সরাসরি এ.টি.এস বোর্ড থেকে ভেরিফায়েড জব লিংক',
      'কোম্পানি লোগো ও স্কিল ম্যাচিং বিশ্লেষণ',
      'Playwright দিয়ে অটোমেটিক আবেদন সুবিধা',
    ],
    domain: 'greenhouse.io • lever.co • workable.com',
    badgeText: '4 ATS Sources',
    previewRole: 'Senior Full Stack Engineer',
    previewCompany: 'Vercel • Remote (Global)',
    previewMeta: '$140k – $180k • Full-time',
    previewScore: '94% Match',
    previewSecondaryRole: 'Backend TypeScript Engineer',
    previewSecondaryMeta: 'Linear • Lever ATS • 89% Match',
    Icon: Globe,
  },
  {
    id: 'linkedin',
    tabLabel: 'LinkedIn Jobs',
    tabLabelBn: 'লিঙ্কডইন জবস',
    title: 'LinkedIn Discovery',
    titleBn: 'লিঙ্কডইন জব ডিসকভারি',
    description:
      'Surface active LinkedIn hiring posts tailored to your target title and core skills, organized alongside your other job feeds.',
    descriptionBn:
      'আপনার টার্গেট রোল ও স্কিলের সাথে সামঞ্জস্যপূর্ণ সক্রিয় লিঙ্কডইন চাকরির বিজ্ঞপ্তি এক জায়গায় পান।',
    bullets: [
      'Targeted role & skill query matching',
      'Direct links to verified LinkedIn job view pages',
      'Dedicated platform filter with live counts',
    ],
    bulletsBn: [
      'রোল ও স্কিল ভিত্তিক নিখুঁত সার্চ কোয়েরি',
      'সরাসরি ভেরিফায়েড লিঙ্কডইন জব পেজ লিংক',
      'প্ল্যাটফর্ম কার্ড থেকে দ্রুত ফিল্টার সুবিধা',
    ],
    domain: 'linkedin.com/jobs',
    badgeText: 'Verified Listings',
    previewRole: 'Product Engineer (React / NestJS)',
    previewCompany: 'Pathao / Global Tech • Hybrid',
    previewMeta: 'Full-time • Mid-Senior Level',
    previewScore: '91% Match',
    previewSecondaryRole: 'Frontend Architect (Next.js)',
    previewSecondaryMeta: 'LinkedIn Jobs • 87% Match',
    Icon: Briefcase,
  },
  {
    id: 'bdjobs',
    tabLabel: 'BDJobs Corporate',
    tabLabelBn: 'বিডিজবস কর্পোরেট',
    title: 'BDJobs Bangladesh',
    titleBn: 'বিডিজবস বাংলাদেশ',
    description:
      'Real-time corporate & tech openings from Bangladesh’s largest career portal, complete with BDT salary ranges, deadlines, and company logos.',
    descriptionBn:
      'বাংলাদেশের সবচেয়ে বড় জব পোর্টাল থেকে বেতন, আবেদনের শেষ তারিখ ও কোম্পানি লোগো সহ রিয়েল-টাইম কর্পোরেট ও টেক চাকরি।',
    bullets: [
      'Instant BDJobs API sync with BDT salary parsing',
      'Experience, location & application deadline tags',
      'One-click Save & direct official job portal apply',
    ],
    bulletsBn: [
      'বেতন ও লোকেশন সহ তাৎক্ষণিক বিডিজবস সিঙ্ক',
      'অভিজ্ঞতা ও আবেদনের শেষ তারিখ প্রদর্শন',
      'সেভ এবং সরাসরি অফিশিয়াল পেজে আবেদন',
    ],
    domain: 'bdjobs.com',
    badgeText: 'Bangladesh Live',
    previewRole: 'Full-Stack TypeScript Developer',
    previewCompany: 'Plug & Solve • Anywhere in BD',
    previewMeta: 'Tk. 60,000 – 110,000 / mo',
    previewScore: '92% Match',
    previewSecondaryRole: 'Full Stack Software Engineer (SaaS)',
    previewSecondaryMeta: 'Renessa Info Systems • Dhaka',
    Icon: Building2,
  },
  {
    id: 'alljobs',
    tabLabel: 'AllJobs Govt (BD)',
    tabLabelBn: 'অলজবস সরকারি চাকরি',
    title: 'AllJobs Teletalk (BD)',
    titleBn: 'অলজবস টেলিটক (সরকারি)',
    description:
      'Discover matched Bangladesh Government & public-sector recruitment circulars cleanly—review openings safely and apply directly on Teletalk.',
    descriptionBn:
      'বাংলাদেশ সরকারি ও স্বায়ত্তশাসিত প্রতিষ্ঠানের নিয়োগ বিজ্ঞপ্তি থেকে ম্যাচ হওয়া পদগুলো দেখুন এবং নিরাপদে সরাসরি টেলিটকে আবেদন করুন।',
    bullets: [
      'Ministry & govt organization circular extraction',
      'Official insignia logos & specific post links',
      'Manual Apply Only — no risky govt auto-apply',
    ],
    bulletsBn: [
      'মন্ত্রণালয় ও সরকারি সংস্থার আলাদা পদ বিশ্লেষণ',
      'অফিশিয়াল লোগো ও সরাসরি সার্কুলার লিংক',
      'নিরাপদ ম্যানুয়াল আবেদন — অটো-অ্যাপ্লাই বন্ধ',
    ],
    domain: 'alljobs.teletalk.com.bd',
    badgeText: 'Govt & Public',
    previewRole: 'Assistant Programmer / IT Officer',
    previewCompany: 'Bangladesh Public Sector Circular',
    previewMeta: 'Dhaka • Official Teletalk Portal',
    previewScore: '88% Match',
    previewSecondaryRole: 'Computer Operator',
    previewSecondaryMeta: 'Dhaka Metropolitan Police (DMP)',
    Icon: Landmark,
  },
  {
    id: 'ai-match',
    tabLabel: 'AI Resume & Match',
    tabLabelBn: 'এআই রিজিউমে ও ম্যাচ',
    title: 'AI Resume Matching',
    titleBn: 'এআই রিজিউমে ম্যাচিং',
    description:
      'Upload your PDF resume once—our AI engine extracts your skills, projects, and target role to rank every job across all 7 platforms.',
    descriptionBn:
      'একবার PDF রিজিউমে আপলোড করলেই এআই আপনার স্কিল ও অভিজ্ঞতা পড়ে ৭টি প্ল্যাটফর্মের প্রতিটি চাকরি স্কোর ও র‍্যাংক করে।',
    bullets: [
      'PDF parsing via Gemini, OpenAI, Groq, or OpenRouter',
      '0–98% dynamic role & skill overlap scoring',
      '6-hour PostgreSQL caching to save API quota',
    ],
    bulletsBn: [
      'Gemini, OpenAI, Groq বা OpenRouter দিয়ে পার্সিং',
      'রোল ও স্কিল অনুযায়ী ডাইনামিক ম্যাচ স্কোর',
      'API কোটা বাঁচাতে ৬ ঘণ্টার স্মার্ট ক্যাশিং',
    ],
    domain: 'kormobot.ai/dashboard/resume',
    badgeText: 'AI Powered',
    previewRole: 'Profile Synced: Full Stack Developer',
    previewCompany: 'Skills: TypeScript, Next.js, NestJS, Prisma',
    previewMeta: 'Scored across 200+ synced jobs',
    previewScore: '96% Top Match',
    previewSecondaryRole: 'Auto-synced with Neon PostgreSQL',
    previewSecondaryMeta: 'Zero duplicate job records',
    Icon: Cpu,
  },
];

export function PlatformShowcase() {
  const { locale } = useI18n();
  const [activeId, setActiveId] = useState<string>(SHOWCASE_ITEMS[0].id);
  const active = SHOWCASE_ITEMS.find((item) => item.id === activeId) ?? SHOWCASE_ITEMS[0];
  const ActiveIcon = active.Icon;

  return (
    <section
      id="platforms"
      className="w-full border-t border-border/80 bg-[#f8f9fd] relative overflow-hidden py-16 sm:py-24 px-6"
    >
      {/* Subtle architectural grid pattern matching reference layout */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-65"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(226, 229, 241, 0.7) 1px, transparent 1px), linear-gradient(to bottom, rgba(226, 229, 241, 0.7) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="max-w-[1160px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Vertical Tabs with Left Rail Active Bar */}
          <div className="lg:col-span-4 text-left lg:pt-2">
            <div className="flex flex-col border-l-2 border-[#e2e5f1]">
              {SHOWCASE_ITEMS.map((item) => {
                const isActive = item.id === active.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    aria-pressed={isActive}
                    className={cn(
                      '-ml-[2px] border-l-2 pl-6 py-2.5 text-left text-[18px] sm:text-[19px] leading-[1.35] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#371ee1]/40',
                      isActive
                        ? 'border-[#371ee1] text-foreground font-semibold'
                        : 'border-transparent text-muted-foreground hover:text-foreground font-medium',
                    )}
                  >
                    {locale === 'bn' ? item.tabLabelBn : item.tabLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Elevated White Split Showcase Card */}
          <div className="lg:col-span-8">
            <div className="bg-card border border-border rounded-md shadow-sm p-5 sm:p-7 min-h-[316px] flex items-center">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-7 items-center w-full">
                {/* Inner Left: High-Contrast Rounded Visual Frame */}
                <div className="md:col-span-6 h-[258px] rounded-md overflow-hidden bg-gradient-to-br from-[#0e1024] via-[#1c1654] to-[#371ee1] p-4 text-white flex flex-col justify-between relative border border-[#371ee1]/25">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.45) 0%, transparent 45%)',
                    }}
                  />

                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-white/90 truncate">
                      <Sparkles className="w-3 h-3 text-[#a5b4fc] shrink-0" />
                      <span className="truncate">{active.domain}</span>
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#eef0fe] text-[#371ee1] shrink-0">
                      {active.badgeText}
                    </span>
                  </div>

                  {/* Primary Preview Job Card */}
                  <div className="relative z-10 space-y-2 my-2">
                    <div className="rounded-md bg-white/10 backdrop-blur-xs border border-white/15 p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-[13px] font-bold text-white leading-snug line-clamp-1">
                          {active.previewRole}
                        </p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-200 border border-emerald-300/25 shrink-0">
                          {active.previewScore}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/80 mb-1.5 truncate">{active.previewCompany}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-white/70 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{active.previewMeta}</span>
                      </div>
                    </div>

                    {/* Secondary Preview Row */}
                    <div className="rounded-md bg-white/5 border border-white/10 px-3 py-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11.5px] font-semibold text-white/90 truncate">
                          {active.previewSecondaryRole}
                        </p>
                        <p className="text-[10.5px] text-white/60 truncate">
                          {active.previewSecondaryMeta}
                        </p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center justify-between text-[11px] text-white/65 pt-1 border-t border-white/10">
                    <span>Kormobot AI Feed</span>
                    <span>6h Smart Cache</span>
                  </div>
                </div>

                {/* Inner Right: Icon Badge + Title + Copy + 3 Checkmarks */}
                <div className="md:col-span-6 text-left md:pl-1 flex flex-col justify-center">
                  <div className="w-8 h-8 rounded-md bg-[#371ee1] text-white flex items-center justify-center mb-4 shadow-xs">
                    <ActiveIcon className="w-4 h-4" />
                  </div>

                  <h2 className="text-[22px] sm:text-[24px] leading-[1.2] font-semibold tracking-tight text-foreground mb-2.5">
                    {locale === 'bn' ? active.titleBn : active.title}
                  </h2>

                  <p className="text-[14px] sm:text-[15px] leading-[1.55] text-muted-foreground mb-4 line-clamp-3">
                    {locale === 'bn' ? active.descriptionBn : active.description}
                  </p>

                  <ul className="space-y-2">
                    {(locale === 'bn' ? active.bulletsBn : active.bullets).map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2 text-[12.5px] sm:text-[13px] leading-[1.4] text-muted-foreground"
                      >
                        <Check className="w-3.5 h-3.5 text-[#371ee1] shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

