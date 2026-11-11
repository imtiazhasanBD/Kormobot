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
export class SerperProvider implements SearchProvider {
  readonly name = 'serper';
  private readonly logger = new Logger(SerperProvider.name);

  async searchJobs(params: JobSearchQuery): Promise<NormalizedJobResult[]> {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      throw new Error('SERPER_API_KEY is not configured in environment variables');
    }

    return executePlatformSearch(
      params.platforms,
      params.maxResults || 10,
      'Serper',
      this.logger,
      (platform, limit) => this.searchSinglePlatform(apiKey, params, platform, limit),
    );
  }

  private async searchSinglePlatform(
    apiKey: string,
    params: JobSearchQuery,
    platform: JobPlatform,
    num: number,
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

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify({ q: query, num }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Serper API (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const organic: Array<{ link: string; title: string; snippet: string }> = data.organic || [];

    return organic
      .map((item) =>
        normalizeSearchResult(
          { url: item.link, title: item.title, content: item.snippet || '' },
          platform,
        ),
      )
      .filter((item): item is NormalizedJobResult => item !== null);
  }
}
