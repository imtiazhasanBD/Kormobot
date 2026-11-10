import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAiProvider } from './providers/openai.provider';
import { GroqProvider } from './providers/groq.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';

@Module({
  providers: [
    AiService,
    GeminiProvider,
    OpenAiProvider,
    GroqProvider,
    OpenRouterProvider,
  ],
  exports: [AiService],
})
export class AiModule {}

