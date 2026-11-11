import { JobPlatform, NormalizedJobResult } from '../interfaces/search-provider.interface';

export const PLATFORM_DOMAINS: Record<JobPlatform, string[]> = {
  greenhouse: ['boards.greenhouse.io', 'job-boards.greenhouse.io'],
  lever: ['jobs.lever.co'],
  workable: ['apply.workable.com'],
  wellfound: ['wellfound.com'],
  linkedin: ['linkedin.com/jobs/view'],
};

const KNOWN_TECH_SKILLS = [
  'TypeScript',
  'JavaScript',
  'React',
  'Next.js',
  'Node.js',
  'NestJS',
  'Express',
  'Python',
  'Django',
  'FastAPI',
  'Go',
  'Java',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Prisma',
  'GraphQL',
  'REST API',
  'Tailwind CSS',
  'Docker',
  'Kubernetes',
  'AWS',
  'GCP',
  'Azure',
  'CI/CD',
  'Playwright',
  'WebSockets',
  'WebRTC',
  'Stripe',
  'React Native',
];

export function detectPlatform(url: string): JobPlatform | null {
  const lower = url.toLowerCase();
  if (lower.includes('greenhouse.io')) return 'greenhouse';
  if (lower.includes('jobs.lever.co') || lower.includes('lever.co')) return 'lever';
  if (lower.includes('workable.com')) return 'workable';
  if (lower.includes('wellfound.com')) return 'wellfound';
  if (lower.includes('linkedin.com/jobs/view')) return 'linkedin';
  return null;
}

export function isSpecificJobUrl(url: string, platform: JobPlatform): boolean {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (platform === 'greenhouse') {
      return segments.includes('jobs') && segments.length >= 2;
    }
    if (platform === 'lever') {
      return segments.length >= 2;
    }
    if (platform === 'workable') {
      return segments.includes('j') || segments.length >= 2;
    }
    if (platform === 'wellfound') {
      return segments[0] === 'jobs' && segments.length >= 2 && /\d+/.test(segments[1]);
    }
    if (platform === 'linkedin') {
      return segments[0] === 'jobs' && segments[1] === 'view' && segments.length >= 3;
    }
    return segments.length >= 1;
  } catch {
    return false;
  }
}

function capitalizeWord(str: string): string {
  return str
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractTitleAndCompany(
  rawTitle: string,
  url: string,
  platform: JobPlatform,
): { title: string; company: string; location?: string } {
  let title = rawTitle
    .replace(/\s*\|\s*(Wellfound|Greenhouse|Lever|Workable|LinkedIn(?:\s+Jobs)?).*$/i, '')
    .trim();
  let company = '';
  let location: string | undefined;

  // Wellfound: "Senior Full Stack Developer at Topflight • California • Remote (Work from Home)"
  if (platform === 'wellfound') {
    const parts = title.split('•').map((p) => p.trim());
    const main = parts[0] || title;
    if (parts.length > 1) {
      location = parts.slice(1).join(' · ');
    }
    const atMatch = main.match(/^(?:Job Title:\s*)?(.+?)\s+at\s+(.+)$/i);
    if (atMatch) {
      title = atMatch[1].trim();
      company = atMatch[2].trim();
    } else {
      title = main.replace(/^Job Title:\s*/i, '').trim();
    }
  } else if (platform === 'linkedin') {
    // LinkedIn: "Full Stack Developer (React, Next.js) at NADSOFT — Jenin, West Bank"
    const dashParts = title.split(/\s+—\s+/);
    const main = dashParts[0] || title;
    if (dashParts.length > 1) {
      location = dashParts.slice(1).join(' · ').trim();
    }
    const atMatch = main.match(/^(.+?)\s+at\s+(.+)$/i);
    if (atMatch) {
      title = atMatch[1].trim();
      company = atMatch[2].trim();
    } else {
      title = main.trim();
    }
  } else if (platform === 'greenhouse') {
    // "Job Application for Senior Engineer at Acme" or "Senior Engineer - Acme"
    const appMatch = title.match(/^Job Application for\s+(.+?)\s+at\s+(.+)$/i);
    if (appMatch) {
      title = appMatch[1].trim();
      company = appMatch[2].trim();
    } else if (title.includes(' - ')) {
      const [t, c] = title.split(' - ');
      title = t.trim();
      company = c.trim();
    }
  } else if (platform === 'lever') {
    // Lever often formats "Company - Role" or "Role - Company"
    if (title.includes(' - ')) {
      const pieces = title.split(' - ').map((s) => s.trim());
      title = pieces[0];
      company = pieces[1] || '';
    }
  } else if (platform === 'workable') {
    if (title.includes(' - ')) {
      const pieces = title.split(' - ').map((s) => s.trim());
      title = pieces[0];
      company = pieces[1] || '';
    }
  }

  // Fallback company extraction from URL slug
  if (!company) {
    try {
      const segments = new URL(url).pathname.split('/').filter(Boolean);
      if (platform !== 'wellfound' && segments.length > 0 && segments[0] !== 'jobs') {
        company = capitalizeWord(segments[0]);
      } else {
        company = capitalizeWord(platform);
      }
    } catch {
      company = capitalizeWord(platform);
    }
  }

  return { title: title || 'Software Engineer', company, location };
}

function extractTags(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const skill of KNOWN_TECH_SKILLS) {
    const token = skill.toLowerCase();
    if (lower.includes(token) && !found.includes(skill)) {
      found.push(skill);
    }
    if (found.length >= 6) break;
  }
  return found;
}

function extractJobType(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('intern')) return 'Internship';
  if (lower.includes('contract') || lower.includes('freelance')) return 'Contract';
  if (lower.includes('part-time') || lower.includes('part time')) return 'Part-time';
  if (lower.includes('remote')) return 'Remote';
  return 'Full-time';
}

function extractExperienceLevel(title: string, text: string): string {
  const combined = `${title} ${text}`.toLowerCase();
  if (combined.includes('intern')) return 'Intern';
  if (combined.includes('staff') || combined.includes('principal') || combined.includes('lead')) {
    return 'Lead / Staff';
  }
  if (combined.includes('senior') || combined.includes('sr.') || combined.includes('5+ years')) {
    return 'Senior';
  }
  if (combined.includes('junior') || combined.includes('jr.') || combined.includes('entry')) {
    return 'Junior';
  }
  return 'Mid-level';
}

function extractSalary(text: string): string | undefined {
  const match = text.match(/(\$|€|£|₹)\s?\d{2,3}(?:,\d{3})?(?:k|K|L)?\s*(?:[-–to]+\s*(?:\$|€|£|₹)?\s?\d{2,3}(?:,\d{3})?(?:k|K|L)?)?/);
  return match ? match[0].trim() : undefined;
}

function extractLocationFallback(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (lower.includes('remote (work from home)') || lower.includes('100% remote') || lower.includes('remote only')) {
    return 'Remote';
  }
  if (lower.includes('san francisco')) return 'San Francisco, CA';
  if (lower.includes('new york')) return 'New York, NY';
  if (lower.includes('london')) return 'London, UK';
  if (lower.includes('remote')) return 'Remote';
  return undefined;
}

export async function executePlatformSearch(
  platformsInput: JobPlatform[] | undefined,
  defaultLimit: number,
  providerLabel: string,
  logger: { warn: (msg: string) => void },
  searchFn: (platform: JobPlatform, limit: number) => Promise<NormalizedJobResult[]>,
): Promise<NormalizedJobResult[]> {
  const platforms: JobPlatform[] = platformsInput?.length
    ? platformsInput
    : ['greenhouse', 'lever', 'workable', 'wellfound', 'linkedin'];
  const perPlatformLimit = platforms.length > 1 ? 5 : defaultLimit;

  const settled = await Promise.allSettled(
    platforms.map((platform) => searchFn(platform, perPlatformLimit)),
  );

  const seenUrls = new Set<string>();
  const results: NormalizedJobResult[] = [];
  for (const outcome of settled) {
    if (outcome.status === 'fulfilled') {
      for (const job of outcome.value) {
        if (!seenUrls.has(job.jobUrl)) {
          seenUrls.add(job.jobUrl);
          results.push(job);
        }
      }
    } else {
      logger.warn(`${providerLabel} platform search failed: ${outcome.reason?.message}`);
    }
  }
  return results;
}

export function normalizeSearchResult(
  raw: { url: string; title: string; content: string },
  fallbackPlatform?: JobPlatform,
): NormalizedJobResult | null {
  if (!raw.url) return null;
  const platform = detectPlatform(raw.url) || fallbackPlatform;
  if (!platform) return null;
  if (!isSpecificJobUrl(raw.url, platform)) return null;

  const { title, company, location: titleLoc } = extractTitleAndCompany(
    raw.title || '',
    raw.url,
    platform,
  );
  const combined = `${raw.title || ''} ${raw.content || ''}`;
  const location = titleLoc || extractLocationFallback(combined) || 'Remote / Hybrid';
  const tags = extractTags(combined);
  const jobType = extractJobType(combined);
  const experienceLevel = extractExperienceLevel(title, raw.content || '');
  const salary = extractSalary(raw.content || '');

  return {
    platform,
    title,
    company,
    location,
    salary,
    jobType,
    experienceLevel,
    description: (raw.content || '').slice(0, 600).trim(),
    tags,
    jobUrl: raw.url,
    sourceUrl: raw.url,
  };
}
