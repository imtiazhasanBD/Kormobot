import { Injectable, Logger } from '@nestjs/common';
import { AiProvider, ParsedResumeResult } from '../interfaces/ai-provider.interface';

@Injectable()
export class OpenAiProvider implements AiProvider {
  readonly name = 'openai';
  private readonly logger = new Logger(OpenAiProvider.name);

  async parseResume(resumeText: string): Promise<ParsedResumeResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY is not set.');
      return { skills: [], experience: [], education: [] };
    }

    try {
      const model = process.env.AI_MODEL || 'gpt-4o-mini';
      const prompt = `Extract all relevant details from this resume and respond ONLY with raw JSON matching this schema:
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "linkedinUrl": "string",
  "githubUrl": "string",
  "summary": "string",
  "skills": ["string"],
  "experience": [{ "company": "string", "title": "string", "duration": "string", "responsibilities": ["string"] }],
  "education": [{ "institution": "string", "degree": "string", "year": "string" }],
  "projects": [{ "name": "string", "description": "string", "url": "string" }]
}

Resume text:
${resumeText}`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      return JSON.parse(content) as ParsedResumeResult;
    } catch (err: any) {
      this.logger.error(`OpenAI parse error: ${err.message}`);
      return { skills: [], experience: [], education: [] };
    }
  }
}

