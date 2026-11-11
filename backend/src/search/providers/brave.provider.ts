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
export class BraveProvider implements SearchProvider {
  readonly name = 'brave';
  private readonly logger = new Logger(BraveProvider.name);

  async searchJobs(params: JobSearchQuery): Promise<NormalizedJobResult[]> {
    const apiKey = process.env.BRAVE_API_KEY;
    if (!apiKey) {
      throw new Error('BRAVE_API_KEY is not configured in environment variables');
    }

    return executePlatformSearch(
      params.platforms,
      params.maxResults || 10,
      'Brave',
      this.logger,
      (platform, limit) => this.searchSinglePlatform(apiKey, params, platform, limit),
    );
  }

  private async searchSinglePlatform(
    apiKey: string,
    params: JobSearchQuery,
    platform: JobPlatform,
    count: number,
  ): Promise<NormalizedJobResult[]> {
    const siteQuery = PLATFORM_DOMAINS[platform].map((d) => `site:${d}`).join(' OR ');
    const query = [
      `(${siteQuery})`,
      params.query || params.role || 'Software Engineer',
      params.skills?.slice(0, 2).join(' ') || '',
      params.location || '',
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    const searchParams = new URLSearchParams({
      q: query,
      count: String(count),
      freshness: 'pm',
    });

    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?${searchParams}`, {
      headers: {
        Accept: 'application/json',
        'X-Subscription-Token': apiKey,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Brave Search API (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const webResults: Array<{ url: string; title: string; description: string }> =
      data?.web?.results || [];

    return webResults
      .map((item) =>
        normalizeSearchResult(
          { url: item.url, title: item.title, content: item.description || '' },
          platform,
        ),
      )
      .filter((item): item is NormalizedJobResult => item !== null);
  }
}
