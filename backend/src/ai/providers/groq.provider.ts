import { Injectable, Logger } from '@nestjs/common';
import { AiProvider, ParsedResumeResult } from '../interfaces/ai-provider.interface';

@Injectable()
export class GroqProvider implements AiProvider {
  readonly name = 'groq';
  private readonly logger = new Logger(GroqProvider.name);

  async parseResume(resumeText: string): Promise<ParsedResumeResult> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY is not set.');
      return { skills: [], experience: [], education: [] };
    }

    try {
      const model = process.env.AI_MODEL || 'llama-3.3-70b-versatile';
      const prompt = `Extract all relevant details from this resume and respond ONLY with valid raw JSON object matching this schema:
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

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
      this.logger.error(`Groq parse error: ${err.message}`);
      return { skills: [], experience: [], education: [] };
    }
  }
}

