import { Injectable, Logger } from '@nestjs/common';
import {
  JobSearchQuery,
  NormalizedJobResult,
  SearchProvider,
} from './interfaces/search-provider.interface';
import { TavilyProvider } from './providers/tavily.provider';
import { BraveProvider } from './providers/brave.provider';
import { SerperProvider } from './providers/serper.provider';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly providers = new Map<string, SearchProvider>();

  constructor(
    private readonly tavily: TavilyProvider,
    private readonly brave: BraveProvider,
    private readonly serper: SerperProvider,
  ) {
    this.providers.set('tavily', this.tavily);
    this.providers.set('brave', this.brave);
    this.providers.set('serper', this.serper);
  }

  getActiveProvider(): SearchProvider {
    const selected = (process.env.SEARCH_PROVIDER || 'tavily').toLowerCase();
    const provider = this.providers.get(selected);
    if (!provider) {
      this.logger.warn(`SEARCH_PROVIDER "${selected}" not recognized. Falling back to Tavily.`);
      return this.tavily;
    }
    return provider;
  }

  async searchJobs(
    params: JobSearchQuery,
  ): Promise<{ provider: string; results: NormalizedJobResult[] }> {
    const provider = this.getActiveProvider();
    this.logger.log(
      `Searching jobs via [${provider.name}] query="${params.query}" platforms=${(params.platforms || ['all']).join(',')}`,
    );
    const results = await provider.searchJobs(params);
    return { provider: provider.name, results };
  }
}

