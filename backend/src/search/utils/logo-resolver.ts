import { NormalizedJobResult } from '../interfaces/search-provider.interface';

const GENERIC_ASSET_PATTERNS = [
  'workable.com/assets',
  'static.licdn.com',
  'greenhouse.io/assets',
  'lever-logo',
  'wellfound.com/assets',
  'wellfound.com/images/shared',
];

function isGenericPlatformAsset(url: string): boolean {
  const lower = url.toLowerCase();
  return GENERIC_ASSET_PATTERNS.some((pattern) => lower.includes(pattern));
}

function extractDomainCandidates(company: string, jobUrl: string): string[] {
  const candidates = new Set<string>();
  const cleaned = company
    .replace(/\s*-\s*LinkedIn.*$/i, '')
    .replace(/\b(inc|llc|ltd|limited|corp|corporation|pvt|gmbh|co|group|technologies|solutions)\b\.?/gi, '')
    .trim();

  if (cleaned) {
    if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(cleaned)) {
      candidates.add(cleaned.toLowerCase());
    } else {
      const slug = cleaned.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (slug.length >= 2) candidates.add(`${slug}.com`);
    }
  }

  // Also check ATS company slug from URL path (greenhouse/lever/workable)
  try {
    const segs = new URL(jobUrl).pathname.split('/').filter(Boolean);
    if (segs[0] && segs[0] !== 'jobs' && segs[0] !== 'j') {
      const atsSlug = segs[0].replace(/-\d+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (atsSlug.length >= 2) {
        candidates.add(`${atsSlug}.com`);
        candidates.add(`${atsSlug}.org`);
      }
    }
  } catch {
    // ignore malformed URL
  }

  return Array.from(candidates);
}

interface PageMetadata {
  logo: string | null;
  postedAt?: Date;
  isClosed?: boolean;
}

const CLOSED_PAGE_PATTERNS = [
  /class=["'][^"']*closed-job/i,
  /no longer accepting applications/i,
  /this job is (?:no longer available|closed|filled)/i,
  /this position (?:has been (?:closed|filled)|is closed)/i,
  /job posting (?:you're looking for )?might have closed/i,
  /we are no longer accepting applications/i,
  /applications (?:are now|have been) closed/i,
  /the job you are looking for has (?:been filled|expired|closed)/i,
  /this listing has expired/i,
  /<body[^>]*class=["'][^"']*404[^"']*["']/i,
  /Sorry, we couldn't find anything here/i,
];

function parsePageDateString(raw: string): Date | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  // 1. "5 days ago", "3 hours ago", "2 weeks ago", "1 month ago"
  const rel = trimmed.match(/(\d+)\s+(minute|hour|day|week|month)s?\s+ago/i);
  if (rel) {
    const amount = parseInt(rel[1], 10);
    const unit = rel[2].toLowerCase();
    const now = Date.now();
    let ms = 0;
    if (unit === 'minute') ms = amount * 60 * 1000;
    else if (unit === 'hour') ms = amount * 60 * 60 * 1000;
    else if (unit === 'day') ms = amount * 24 * 60 * 60 * 1000;
    else if (unit === 'week') ms = amount * 7 * 24 * 60 * 60 * 1000;
    else if (unit === 'month') ms = amount * 30 * 24 * 60 * 60 * 1000;
    return new Date(now - ms);
  }

  // 2. ISO or standard date strings (e.g. "2024-07-23T22:57:43+00:00", "2026-11-08")
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) return parsed;

  return undefined;
}

async function extractPageMetadata(jobUrl: string): Promise<PageMetadata> {
  try {
    const res = await fetch(jobUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(4500),
    });
    if (!res.ok) {
      const isDeadUrl = res.status === 404 || res.status === 410;
      return { logo: null, isClosed: isDeadUrl };
    }

    const html = await res.text();
    const isClosed = CLOSED_PAGE_PATTERNS.some((pattern) => pattern.test(html));
    let logo: string | null = null;
    let postedAt: Date | undefined;

    // 1. Extract published / posted date from LinkedIn posted-time-ago, time tags, meta or JSON-LD
    const dateMatch =
      html.match(/class=["'](?:[^"']*\s)?posted-time-ago__text(?:\s[^"']*)?["'][^>]*>\s*([^<]+)\s*<\/span>/i) ||
      html.match(/<time[^>]+datetime=["']([^"']+)["'][^>]*>/i) ||
      html.match(/<meta[^>]+property=["'](?:article:published_time|og:updated_time)["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["'](?:article:published_time|og:updated_time)["']/i) ||
      html.match(/"(?:datePosted|datePublished)":\s*"([^"]+)"/i);

    if (dateMatch?.[1]) {
      postedAt = parsePageDateString(dateMatch[1]);
    }

    // 2. Extract logo from og:image or <img ...logo...>
    const ogMatch =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

    const ogUrl = ogMatch?.[1]?.trim();
    if (ogUrl && ogUrl.startsWith('http') && !isGenericPlatformAsset(ogUrl)) {
      logo = ogUrl;
    } else {
      const imgMatch = html.match(/<img[^>]+src=["'](https?:\/\/[^"']*logo[^"']*)["']/i);
      const imgUrl = imgMatch?.[1]?.trim();
      if (imgUrl && !isGenericPlatformAsset(imgUrl)) {
        logo = imgUrl;
      }
    }

    return { logo, postedAt, isClosed };
  } catch {
    return { logo: null };
  }
}

async function resolveVerifiedFavicon(company: string, jobUrl: string): Promise<string | null> {
  const domains = extractDomainCandidates(company, jobUrl);
  for (const domain of domains) {
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
    try {
      const res = await fetch(faviconUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) return faviconUrl;
    } catch {
      // continue to next domain candidate
    }
  }
  return null;
}

export async function resolveCompanyLogoAndMetadata(
  job: Pick<NormalizedJobResult, 'platform' | 'company' | 'jobUrl' | 'companyLogo' | 'postedAt' | 'isClosed'>,
): Promise<{ logo: string | null; postedAt?: Date; isClosed?: boolean }> {
  let logo = job.companyLogo || null;
  let postedAt = job.postedAt ? new Date(job.postedAt) : undefined;
  let isClosed = Boolean(job.isClosed);

  if (
    job.platform === 'greenhouse' ||
    job.platform === 'wellfound' ||
    job.platform === 'lever' ||
    job.platform === 'workable' ||
    job.platform === 'linkedin'
  ) {
    const pageMeta = await extractPageMetadata(job.jobUrl);
    if (!logo && pageMeta.logo) logo = pageMeta.logo;
    if (!postedAt && pageMeta.postedAt) postedAt = pageMeta.postedAt;
    if (pageMeta.isClosed) isClosed = true;
  }

  if (!logo) {
    logo = await resolveVerifiedFavicon(job.company, job.jobUrl);
  }

  return { logo, postedAt, isClosed };
}

export async function enrichJobsWithLogos(
  jobs: NormalizedJobResult[],
  concurrency = 6,
): Promise<NormalizedJobResult[]> {
  const results = [...jobs];
  for (let i = 0; i < jobs.length; i += concurrency) {
    const batch = jobs.slice(i, i + concurrency);
    const settled = await Promise.allSettled(
      batch.map(async (job) => {
        const meta = await resolveCompanyLogoAndMetadata(job);
        return {
          ...job,
          companyLogo: meta.logo || job.companyLogo || undefined,
          postedAt: meta.postedAt || job.postedAt || undefined,
          isClosed: Boolean(meta.isClosed || job.isClosed),
        };
      }),
    );
    settled.forEach((outcome, offset) => {
      if (outcome.status === 'fulfilled') {
        results[i + offset] = outcome.value;
      }
    });
  }
  return results;
}
