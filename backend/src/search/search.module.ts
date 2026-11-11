import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { TavilyProvider } from './providers/tavily.provider';
import { BraveProvider } from './providers/brave.provider';
import { SerperProvider } from './providers/serper.provider';

@Module({
  providers: [SearchService, TavilyProvider, BraveProvider, SerperProvider],
  exports: [SearchService],
})
export class SearchModule {}
