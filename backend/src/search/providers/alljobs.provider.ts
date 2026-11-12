import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { chromium, Browser } from 'playwright';
import {
  JobSearchQuery,
  NormalizedJobResult,
  SearchProvider,
} from '../interfaces/search-provider.interface';

interface AllJobsGovtPost {
  id: number;
  job_title?: string | null;
  job_title_bn?: string | null;
  organization_id?: number;
}

interface AllJobsGovtOrg {
  id: number;
  name: string;
  name_bn?: string | null;
  short_name?: string | null;
  logo?: string | null;
  website?: string | null;
  job_created_at?: string | null;
  govt_jobs?: AllJobsGovtPost[];
}

interface AllJobsPrivateItem {
  id: number;
  job_title?: string | null;
  title?: string | null;
  name?: string | null;
  organization_name?: string | null;
  company_name?: string | null;
  logo?: string | null;
  location?: string | null;
}

const ALLJOBS_BASE_URL = 'https://alljobs.teletalk.com.bd';
const SYSTEM_CHROME_PATH = '/usr/bin/google-chrome';

@Injectable()
export class AllJobsProvider implements SearchProvider {
  readonly name = 'alljobs';
  private readonly logger = new Logger(AllJobsProvider.name);

  async searchJobs(params: JobSearchQuery): Promise<NormalizedJobResult[]> {
    const limit = params.platforms?.length === 1 ? 40 : 25;
    let browser: Browser | null = null;

    try {
      const executablePath = fs.existsSync(SYSTEM_CHROME_PATH)
        ? SYSTEM_CHROME_PATH
        : undefined;

      browser = await chromium.launch({
        ...(executablePath ? { executablePath } : {}),
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      });
      const page = await context.newPage();

      const govtOrgs: AllJobsGovtOrg[] = [];
      const privateItems: AllJobsPrivateItem[] = [];

      page.on('response', async (res) => {
        const url = res.url();
        if (res.status() !== 200) return;

        try {
          if (url.includes('/api/v1/govt-jobs/org-list')) {
            const data = await res.json();
            if (Array.isArray(data?.govtOrgJobs)) {
              govtOrgs.push(...data.govtOrgJobs);
            }
          } else if (url.includes('/api/v1/private-jobs/recruiter-list')) {
            const data = await res.json();
            if (Array.isArray(data?.privateRecruiterJobs)) {
              privateItems.push(...data.privateRecruiterJobs);
            }
          }
        } catch {
          // Ignore non-JSON or closed-page responses
        }
      });

      await page.goto(`${ALLJOBS_BASE_URL}/jobs/government`, {
        waitUntil: 'networkidle',
        timeout: 25000,
      });
      await page.waitForTimeout(800);

      // Fallback to rendered DOM cards if API capture returned nothing
      let domFallbackJobs: NormalizedJobResult[] = [];
      if (govtOrgs.length === 0) {
        domFallbackJobs = await this.extractDomJobs(page, 'government');
      }

      // Check private jobs tab as well
      try {
        await page.goto(`${ALLJOBS_BASE_URL}/jobs/private`, {
          waitUntil: 'networkidle',
          timeout: 15000,
        });
        await page.waitForTimeout(500);
      } catch (err: any) {
        this.logger.warn(`AllJobs private tab load skipped: ${err.message}`);
      }

      const normalized: NormalizedJobResult[] = [
        ...this.normalizeGovtOrgs(govtOrgs),
        ...this.normalizePrivateItems(privateItems),
        ...domFallbackJobs,
      ];

      const deduplicated = this.deduplicateByUrl(normalized);
      const ranked = this.rankByRelevance(deduplicated, params);

      this.logger.log(
        `AllJobs BD scraped ${ranked.length} jobs (returning top ${Math.min(limit, ranked.length)})`,
      );

      return ranked.slice(0, limit);
    } catch (err: any) {
      this.logger.error(`AllJobsProvider scrape failed: ${err.message}`);
      return [];
    } finally {
      if (browser) {
        await browser.close().catch(() => undefined);
      }
    }
  }

  private resolveLogoUrl(logo?: string | null): string | undefined {
    if (!logo) return undefined;
    const trimmed = logo.trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    const cleanPath = trimmed.replace(/^\/+/, '');
    if (cleanPath.startsWith('media/')) {
      return `${ALLJOBS_BASE_URL}/${cleanPath}`;
    }
    return `${ALLJOBS_BASE_URL}/media/${cleanPath}`;
  }

  private normalizeGovtOrgs(orgs: AllJobsGovtOrg[]): NormalizedJobResult[] {
    const results: NormalizedJobResult[] = [];

    for (const org of orgs) {
      const companyName = org.name?.trim();
      if (!companyName) continue;

      const companyLogo = this.resolveLogoUrl(org.logo);
      const posts = Array.isArray(org.govt_jobs) ? org.govt_jobs : [];

      if (posts.length === 0) {
        results.push({
          platform: 'alljobs',
          title: `${companyName} Recruitment`,
          company: companyName,
          companyLogo,
          location: 'Bangladesh',
          jobType: 'Full-time',
          experienceLevel: 'Govt / Public Sector',
          description: `Official Bangladesh Government recruitment circular at ${companyName}.${
            org.website ? ` Website: ${org.website}` : ''
          }`,
          tags: [org.short_name || '', 'Bangladesh', 'Govt Job', 'AllJobs'].filter(Boolean),
          jobUrl: `${ALLJOBS_BASE_URL}/jobs/government/${org.id}`,
          sourceUrl: `${ALLJOBS_BASE_URL}/jobs/government`,
        });
        continue;
      }

      for (const post of posts) {
        const title =
          post.job_title?.trim() ||
          post.job_title_bn?.trim() ||
          `${companyName} Position`;

        const tags = Array.from(
          new Set(
            [
              org.short_name?.trim(),
              'Bangladesh',
              'Govt Job',
              'Teletalk',
            ].filter((t): t is string => Boolean(t)),
          ),
        );

        const bnSuffix =
          post.job_title_bn && post.job_title_bn !== post.job_title
            ? ` (${post.job_title_bn.trim()})`
            : '';

        results.push({
          platform: 'alljobs',
          title,
          company: companyName,
          companyLogo,
          location: 'Bangladesh',
          jobType: 'Full-time',
          experienceLevel: 'Govt / Public Sector',
          description: `Bangladesh Government job circular at ${companyName}${
            org.short_name ? ` (${org.short_name})` : ''
          }. Post: ${title}${bnSuffix}.${org.website ? ` Official site: ${org.website}` : ''}`,
          tags,
          jobUrl: `${ALLJOBS_BASE_URL}/jobs/government/${org.id}?jobId=${post.id}`,
          sourceUrl: `${ALLJOBS_BASE_URL}/jobs/government`,
        });
      }
    }

    return results;
  }

  private normalizePrivateItems(items: AllJobsPrivateItem[]): NormalizedJobResult[] {
    const results: NormalizedJobResult[] = [];
    for (const item of items) {
      const title = item.job_title?.trim() || item.title?.trim() || item.name?.trim();
      const company =
        item.organization_name?.trim() || item.company_name?.trim() || 'Bangladesh Employer';
      if (!title) continue;

      results.push({
        platform: 'alljobs',
        title,
        company,
        companyLogo: this.resolveLogoUrl(item.logo),
        location: item.location?.trim() || 'Bangladesh',
        jobType: 'Full-time',
        experienceLevel: 'Private Sector',
        description: `Private sector job opportunity in Bangladesh listed on AllJobs Teletalk: ${title} at ${company}.`,
        tags: ['Bangladesh', 'Private Job', 'AllJobs'],
        jobUrl: `${ALLJOBS_BASE_URL}/jobs/private/${item.id}`,
        sourceUrl: `${ALLJOBS_BASE_URL}/jobs/private`,
      });
    }
    return results;
  }

  private async extractDomJobs(
    page: import('playwright').Page,
    section: 'government' | 'private',
  ): Promise<NormalizedJobResult[]> {
    const raw = await page.evaluate((sec) => {
      const anchors = Array.from(document.querySelectorAll(`a[href*="/jobs/${sec}/"]`));
      return anchors.map((a) => {
        const href = a.getAttribute('href') || '';
        const img = a.querySelector('img')?.getAttribute('src') || undefined;
        const text = (a as HTMLElement).innerText.replace(/\s+/g, ' ').trim();
        return { href, img, text };
      });
    }, section);

    return raw
      .filter((item) => item.href && item.text)
      .map((item) => {
        const cleanTitle = item.text.replace(/View job$/i, '').trim();
        return {
          platform: 'alljobs' as const,
          title: cleanTitle,
          company: cleanTitle.split('Openings:')[0]?.trim() || 'Bangladesh Govt',
          companyLogo: this.resolveLogoUrl(item.img),
          location: 'Bangladesh',
          jobType: 'Full-time',
          experienceLevel: section === 'government' ? 'Govt / Public Sector' : 'Private Sector',
          description: `${cleanTitle} — listed on AllJobs Teletalk Bangladesh.`,
          tags: ['Bangladesh', section === 'government' ? 'Govt Job' : 'Private Job', 'AllJobs'],
          jobUrl: item.href.startsWith('http')
            ? item.href
            : `${ALLJOBS_BASE_URL}${item.href.startsWith('/') ? '' : '/'}${item.href}`,
          sourceUrl: `${ALLJOBS_BASE_URL}/jobs/${section}`,
        };
      });
  }

  private deduplicateByUrl(jobs: NormalizedJobResult[]): NormalizedJobResult[] {
    const seen = new Set<string>();
    return jobs.filter((job) => {
      if (seen.has(job.jobUrl)) return false;
      seen.add(job.jobUrl);
      return true;
    });
  }

  private rankByRelevance(
    jobs: NormalizedJobResult[],
    params: JobSearchQuery,
  ): NormalizedJobResult[] {
    const rawTokens = [
      params.query,
      params.role,
      ...(params.skills || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .split(/[\s,/|-]+/)
      .filter((t) => t.length > 2);

    const tokens = Array.from(new Set(rawTokens));
    if (tokens.length === 0) return jobs;

    return [...jobs].sort((a, b) => {
      const scoreA = this.relevanceScore(a, tokens);
      const scoreB = this.relevanceScore(b, tokens);
      return scoreB - scoreA;
    });
  }

  private relevanceScore(job: NormalizedJobResult, tokens: string[]): number {
    const titleLower = job.title.toLowerCase();
    const haystack = `${titleLower} ${job.company.toLowerCase()} ${(job.description || '').toLowerCase()}`;
    let score = 0;
    for (const token of tokens) {
      if (titleLower.includes(token)) score += 3;
      else if (haystack.includes(token)) score += 1;
    }
    return score;
  }
}

