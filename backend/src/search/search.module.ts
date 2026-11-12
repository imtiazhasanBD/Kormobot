import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { TavilyProvider } from './providers/tavily.provider';
import { BraveProvider } from './providers/brave.provider';
import { SerperProvider } from './providers/serper.provider';
import { AllJobsProvider } from './providers/alljobs.provider';
import { BdJobsProvider } from './providers/bdjobs.provider';

@Module({
  providers: [SearchService, TavilyProvider, BraveProvider, SerperProvider, AllJobsProvider, BdJobsProvider],
  exports: [SearchService],
})
export class SearchModule {}
