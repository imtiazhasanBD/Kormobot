import { Injectable, Logger } from '@nestjs/common';
import {
  JobPlatform,
  JobSearchQuery,
  NormalizedJobResult,
  SearchProvider,
} from '../interfaces/search-provider.interface';
import {
  executePlatformSearch,
  normalizeSearchResult,
  PLATFORM_DOMAINS,
} from '../utils/job-normalizer';

@Injectable()
export class TavilyProvider implements SearchProvider {
  readonly name = 'tavily';
  private readonly logger = new Logger(TavilyProvider.name);

  async searchJobs(params: JobSearchQuery): Promise<NormalizedJobResult[]> {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      throw new Error('TAVILY_API_KEY is not configured in environment variables');
    }

    return executePlatformSearch(
      params.platforms,
      params.maxResults || 12,
      'Tavily',
      this.logger,
      (platform, limit) => this.searchSinglePlatform(apiKey, params, platform, limit),
    );
  }

  private async searchSinglePlatform(
    apiKey: string,
    params: JobSearchQuery,
    platform: JobPlatform,
    maxResults: number,
  ): Promise<NormalizedJobResult[]> {
    const query = [
      params.query || params.role || 'Full Stack Software Engineer',
      params.skills?.slice(0, 3).join(' ') || '',
      params.location || '',
      params.jobType || '',
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        include_domains: PLATFORM_DOMAINS[platform],
        max_results: maxResults,
        search_depth: 'basic',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Tavily API (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawResults: Array<{ url: string; title: string; content: string }> = data.results || [];
    return rawResults
      .map((item) => normalizeSearchResult(item, platform))
      .filter((item): item is NormalizedJobResult => item !== null);
  }
}
