import { Injectable, Logger } from '@nestjs/common';
import { AiProvider, ParsedResumeResult } from './interfaces/ai-provider.interface';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAiProvider } from './providers/openai.provider';
import { GroqProvider } from './providers/groq.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private providers = new Map<string, AiProvider>();

  constructor(
    private readonly gemini: GeminiProvider,
    private readonly openai: OpenAiProvider,
    private readonly groq: GroqProvider,
    private readonly openrouter: OpenRouterProvider,
  ) {
    this.providers.set('gemini', this.gemini);
    this.providers.set('openai', this.openai);
    this.providers.set('groq', this.groq);
    this.providers.set('openrouter', this.openrouter);
  }

  getActiveProvider(): AiProvider {
    const selected = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
    const provider = this.providers.get(selected);
    if (!provider) {
      this.logger.warn(`AI provider "${selected}" not recognized. Falling back to Gemini.`);
      return this.gemini;
    }
    return provider;
  }

  async parseResume(resumeText: string): Promise<ParsedResumeResult> {
    const provider = this.getActiveProvider();
    this.logger.log(`Parsing resume with active provider: [${provider.name}]`);
    return provider.parseResume(resumeText);
  }
}

