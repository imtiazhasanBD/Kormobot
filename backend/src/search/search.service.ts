import { Injectable, Logger } from '@nestjs/common';
import {
  JobSearchQuery,
  NormalizedJobResult,
  SearchProvider,
} from './interfaces/search-provider.interface';
import { TavilyProvider } from './providers/tavily.provider';
import { BraveProvider } from './providers/brave.provider';
import { SerperProvider } from './providers/serper.provider';
import { AllJobsProvider } from './providers/alljobs.provider';
import { BdJobsProvider } from './providers/bdjobs.provider';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly providers = new Map<string, SearchProvider>();

  constructor(
    private readonly tavily: TavilyProvider,
    private readonly brave: BraveProvider,
    private readonly serper: SerperProvider,
    private readonly allJobs: AllJobsProvider,
    private readonly bdJobs: BdJobsProvider,
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
    const requestedPlatforms = params.platforms;
    const includeAllJobs =
      !requestedPlatforms?.length || requestedPlatforms.includes('alljobs');
    const includeBdJobs =
      !requestedPlatforms?.length || requestedPlatforms.includes('bdjobs');
    const webPlatforms = requestedPlatforms?.length
      ? requestedPlatforms.filter((p) => p !== 'alljobs' && p !== 'bdjobs')
      : (['greenhouse', 'lever', 'workable', 'wellfound', 'linkedin'] as const);

    const webProvider = this.getActiveProvider();
    const tasks: Array<{ label: string; run: Promise<NormalizedJobResult[]> }> = [];

    if (webPlatforms.length > 0) {
      tasks.push({
        label: webProvider.name,
        run: webProvider.searchJobs({ ...params, platforms: [...webPlatforms] }),
      });
    }
    if (includeAllJobs) {
      tasks.push({
        label: 'alljobs',
        run: this.allJobs.searchJobs(params),
      });
    }
    if (includeBdJobs) {
      tasks.push({
        label: 'bdjobs',
        run: this.bdJobs.searchJobs(params),
      });
    }

    const activeLabel = tasks.map((t) => t.label).join('+');
    this.logger.log(
      `Searching jobs via [${activeLabel}] query="${params.query}" platforms=${(requestedPlatforms || ['all']).join(',')}`,
    );

    const outcomes = await Promise.allSettled(tasks.map((t) => t.run));
    const combined: NormalizedJobResult[] = [];
    let firstError: unknown = null;
    let succeededCount = 0;

    outcomes.forEach((outcome, index) => {
      if (outcome.status === 'fulfilled') {
        succeededCount += 1;
        combined.push(...outcome.value);
      } else {
        firstError ??= outcome.reason;
        this.logger.warn(`Provider [${tasks[index].label}] failed: ${outcome.reason}`);
      }
    });

    if (succeededCount === 0 && firstError) {
      throw firstError;
    }

    return { provider: activeLabel, results: combined };
  }
}

