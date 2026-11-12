import { Injectable, Logger } from '@nestjs/common';
import {
  JobSearchQuery,
  NormalizedJobResult,
  SearchProvider,
} from '../interfaces/search-provider.interface';

interface BdJobsApiItem {
  Jobid?: string | number;
  jobTitle?: string | null;
  companyName?: string | null;
  deadline?: string | null;
  eduRec?: string | null;
  experience?: string | null;
  location?: string | null;
  jobContext?: string | null;
  jobDescription?: string | null;
  logoUrl?: string | null;
  JobType?: string | null;
  Salary?: string | null;
  WorkPlace?: string | null;
}

const BDJOBS_API_URL = 'https://api.bdjobs.com/jobs/api/v1/JobSearch/GetJobSearch';
const BDJOBS_BASE_URL = 'https://bdjobs.com';

@Injectable()
export class BdJobsProvider implements SearchProvider {
  readonly name = 'bdjobs';
  private readonly logger = new Logger(BdJobsProvider.name);

  async searchJobs(params: JobSearchQuery): Promise<NormalizedJobResult[]> {
    const limit = params.platforms?.length === 1 ? 40 : 25;
    const primaryKeyword = (params.query || params.role || '').trim();

    try {
      const collected = new Map<string, BdJobsApiItem>();

      const primaryItems = await this.fetchSearchPage(primaryKeyword, limit);
      for (const item of primaryItems) {
        if (item.Jobid) collected.set(String(item.Jobid), item);
      }

      // Broaden once with first skill or general latest jobs if narrow keyword returned very few matches
      if (collected.size < 8) {
        const fallbackKeyword =
          params.skills?.find((s) => s.trim().length > 2 && s.toLowerCase() !== primaryKeyword.toLowerCase()) || '';
        const fallbackItems = await this.fetchSearchPage(fallbackKeyword, limit);
        for (const item of fallbackItems) {
          if (item.Jobid && !collected.has(String(item.Jobid))) {
            collected.set(String(item.Jobid), item);
          }
        }
      }

      const normalized = Array.from(collected.values())
        .map((item) => this.toNormalizedJob(item))
        .filter((job): job is NormalizedJobResult => job !== null)
        .slice(0, limit);

      this.logger.log(
        `BDJobs fetched ${normalized.length} jobs (keyword="${primaryKeyword || 'latest'}")`,
      );
      return normalized;
    } catch (err: any) {
      this.logger.error(`BdJobsProvider failed: ${err.message}`);
      return [];
    }
  }

  private async fetchSearchPage(keyword: string, rpp: number): Promise<BdJobsApiItem[]> {
    const query = new URLSearchParams({
      Icat: '',
      industry: '',
      category: '',
      org: '',
      jobNature: '',
      Fcat: '',
      location: '',
      Qot: '',
      jobType: '',
      jobLevel: '',
      postedWithin: '',
      deadline: '',
      keyword,
      pg: '1',
      qAge: '',
      Salary: '',
      experience: '',
      gender: '',
      MExp: '',
      genderB: '',
      MPostings: '',
      MCat: '',
      version: '',
      rpp: String(Math.min(50, Math.max(10, rpp))),
      Newspaper: '',
      armyp: '',
      QDisablePerson: '',
      pwd: '',
      workplace: '',
      facilitiesForPWD: '',
      SaveFilterList: '',
      UserFilterName: '',
      HUserFilterName: '',
      earlyJobAccess: '',
      ToggleJobs: 'true',
      isFresher: 'false',
    });

    const response = await fetch(`${BDJOBS_API_URL}?${query.toString()}`, {
      headers: {
        Origin: BDJOBS_BASE_URL,
        Referer: `${BDJOBS_BASE_URL}/`,
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`BDJobs API returned HTTP ${response.status}`);
    }

    const payload = (await response.json()) as { data?: BdJobsApiItem[] };
    return Array.isArray(payload?.data) ? payload.data : [];
  }

  private toNormalizedJob(item: BdJobsApiItem): NormalizedJobResult | null {
    const jobId = item.Jobid ? String(item.Jobid).trim() : '';
    const title = item.jobTitle?.trim();
    if (!jobId || !title) return null;

    const company = item.companyName?.trim() || 'Bangladesh Employer';
    const contextText = this.stripHtml(item.jobContext);
    const descText = this.stripHtml(item.jobDescription);
    const eduText = this.stripHtml(item.eduRec);

    const summaryParts = [
      contextText,
      descText,
      eduText ? `Education: ${eduText}` : '',
      item.deadline ? `Deadline: ${item.deadline}` : '',
    ].filter(Boolean);

    const salary =
      item.Salary && item.Salary.trim() && item.Salary.trim() !== '--'
        ? item.Salary.trim()
        : undefined;

    const tags = Array.from(
      new Set(
        [
          'Bangladesh',
          item.WorkPlace?.trim(),
          item.experience?.trim(),
          item.deadline ? `Deadline: ${item.deadline}` : undefined,
          'BDJobs',
        ].filter((t): t is string => Boolean(t)),
      ),
    );

    return {
      platform: 'bdjobs',
      title,
      company,
      companyLogo: item.logoUrl?.trim() || undefined,
      location: item.location?.trim() || 'Bangladesh',
      salary,
      jobType: this.normalizeJobType(item.JobType),
      experienceLevel: item.experience?.trim() || undefined,
      description:
        summaryParts.join(' • ').slice(0, 1200) ||
        `${title} at ${company} listed on Bdjobs.com.`,
      tags,
      jobUrl: `${BDJOBS_BASE_URL}/h/details/${jobId}?ln=1`,
      sourceUrl: `${BDJOBS_BASE_URL}/h/jobs?lang=en`,
    };
  }

  private normalizeJobType(raw?: string | null): string {
    const val = (raw || '').toLowerCase();
    if (val.includes('part')) return 'Part-time';
    if (val.includes('contract')) return 'Contract';
    if (val.includes('intern')) return 'Internship';
    return 'Full-time';
  }

  private stripHtml(raw?: string | null): string {
    if (!raw) return '';
    return raw
      .replace(/<[^>]+>/g, ' ')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

