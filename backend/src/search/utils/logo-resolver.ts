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

async function extractOgLogoFromPage(jobUrl: string): Promise<string | null> {
  try {
    const res = await fetch(jobUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Kormobot/1.0)' },
      signal: AbortSignal.timeout(4500),
    });
    if (!res.ok) return null;

    const html = await res.text();
    const ogMatch =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

    const ogUrl = ogMatch?.[1]?.trim();
    if (ogUrl && ogUrl.startsWith('http') && !isGenericPlatformAsset(ogUrl)) {
      return ogUrl;
    }

    const imgMatch = html.match(/<img[^>]+src=["'](https?:\/\/[^"']*logo[^"']*)["']/i);
    const imgUrl = imgMatch?.[1]?.trim();
    if (imgUrl && !isGenericPlatformAsset(imgUrl)) {
      return imgUrl;
    }

    return null;
  } catch {
    return null;
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

export async function resolveCompanyLogo(
  job: Pick<NormalizedJobResult, 'platform' | 'company' | 'jobUrl' | 'companyLogo'>,
): Promise<string | null> {
  if (job.companyLogo) return job.companyLogo;

  if (job.platform === 'greenhouse' || job.platform === 'wellfound') {
    const pageLogo = await extractOgLogoFromPage(job.jobUrl);
    if (pageLogo) return pageLogo;
  }

  return resolveVerifiedFavicon(job.company, job.jobUrl);
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
        const logo = await resolveCompanyLogo(job);
        return { ...job, companyLogo: logo || undefined };
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
