export type Locale = 'en' | 'bn';

export interface TranslationSchema {
  common: {
    appName: string;
    tagline: string;
    login: string;
    register: string;
    logout: string;
    dashboard: string;
    loading: string;
    save: string;
    cancel: string;
    language: string;
  };
  nav: {
    jobs: string;
    resume: string;
    profile: string;
    savedJobs: string;
    applicationStatus: string;
    billing: string;
    settings: string;
  };
  jobs: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    applyNow: string;
    applyAutomatically: string;
    applyManually: string;
    saved: string;
    saveForLater: string;
    matchScore: string;
  };
  profile: {
    title: string;
    completeness: string;
    personalTab: string;
    experienceTab: string;
    educationTab: string;
    skillsTab: string;
    preferencesTab: string;
  };
  billing: {
    title: string;
    freePlan: string;
    proPlan: string;
    unlimitedPlan: string;
    currentPlan: string;
    dailyLimit: string;
    upgrade: string;
  };
}

export const translations: Record<Locale, TranslationSchema> = {
  en: {
    common: {
      appName: 'Kormobot AI',
      tagline: 'Your Autonomous AI Job Application Agent',
      login: 'Sign In',
      register: 'Sign Up',
      logout: 'Log Out',
      dashboard: 'Dashboard',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      language: 'Language',
    },
    nav: {
      jobs: 'Jobs',
      resume: 'Resume',
      profile: 'Profile',
      savedJobs: 'Saved Jobs',
      applicationStatus: 'Application Status',
      billing: 'Billing / Credits',
      settings: 'Settings',
    },
    jobs: {
      title: 'Find & Auto-Apply to Jobs',
      subtitle: 'Powered by AI across Greenhouse, Lever, Workable, and Wellfound',
      searchPlaceholder: 'Search jobs, skills, companies...',
      applyNow: 'Apply Now',
      applyAutomatically: 'Apply with AI',
      applyManually: 'Apply Manually',
      saved: 'Saved',
      saveForLater: 'Save for Later',
      matchScore: 'Match',
    },
    profile: {
      title: 'Your Profile',
      completeness: 'Profile Completeness',
      personalTab: 'Personal Info',
      experienceTab: 'Experience',
      educationTab: 'Education',
      skillsTab: 'Skills',
      preferencesTab: 'Preferences',
    },
    billing: {
      title: 'Subscription & Credits',
      freePlan: 'Free',
      proPlan: 'Pro',
      unlimitedPlan: 'Unlimited',
      currentPlan: 'Current Plan',
      dailyLimit: 'Daily AI Applies',
      upgrade: 'Upgrade Plan',
    },
  },
  bn: {
    common: {
      appName: 'কর্মবট এআই',
      tagline: 'আপনার স্বায়ত্তশাসিত এআই চাকরি আবেদন সহকারী',
      login: 'লগইন করুন',
      register: 'নিবন্ধন করুন',
      logout: 'লগআউট',
      dashboard: 'ড্যাশবোর্ড',
      loading: 'লোড হচ্ছে...',
      save: 'সংরক্ষণ করুন',
      cancel: 'বাতিল',
      language: 'ভাষা',
    },
    nav: {
      jobs: 'চাকরি সমূহ',
      resume: 'রিজিউম',
      profile: 'প্রোফাইল',
      savedJobs: 'সংরক্ষিত চাকরি',
      applicationStatus: 'আবেদনের অবস্থা',
      billing: 'বিলিং ও ক্রেডিট',
      settings: 'সেটিংস',
    },
    jobs: {
      title: 'চাকরি খুঁজুন এবং স্বয়ংক্রিয়ভাবে আবেদন করুন',
      subtitle: 'গ্রিনহাউস, লিভার, ওয়ার্কেবল এবং ওয়েলফাউন্ডের শীর্ষ চাকরির সন্ধান',
      searchPlaceholder: 'চাকরি, দক্ষতা বা কোম্পানি খুঁজুন...',
      applyNow: 'আবেদন করুন',
      applyAutomatically: 'এআই দিয়ে স্বয়ংক্রিয় আবেদন',
      applyManually: 'নিজে আবেদন করুন',
      saved: 'সংরক্ষিত',
      saveForLater: 'পরে আবেদনের জন্য রাখুন',
      matchScore: 'মিল',
    },
    profile: {
      title: 'আপনার প্রোফাইল',
      completeness: 'প্রোফাইল সম্পূর্ণতা',
      personalTab: 'ব্যক্তিগত তথ্য',
      experienceTab: 'কাজের অভিজ্ঞতা',
      educationTab: 'শিক্ষাগত যোগ্যতা',
      skillsTab: 'দক্ষতা সমূহ',
      preferencesTab: 'পছন্দসমূহ',
    },
    billing: {
      title: 'সাবস্ক্রিপশন ও ক্রেডিট',
      freePlan: 'ফ্রি',
      proPlan: 'প্রো',
      unlimitedPlan: 'আনলিমিটেড',
      currentPlan: 'বর্তমান প্ল্যান',
      dailyLimit: 'দৈনিক এআই আবেদন',
      upgrade: 'প্ল্যান আপগ্রেড করুন',
    },
  },
};
