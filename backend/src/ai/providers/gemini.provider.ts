import { Injectable, Logger } from '@nestjs/common';
import { AiProvider, ParsedResumeResult } from '../interfaces/ai-provider.interface';

@Injectable()
export class GeminiProvider implements AiProvider {
  readonly name = 'gemini';
  private readonly logger = new Logger(GeminiProvider.name);

  async parseResume(resumeText: string): Promise<ParsedResumeResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set. Returning empty structure.');
      return this.fallback(resumeText);
    }

    try {
      const model = process.env.AI_MODEL || 'gemini-1.5-flash';
      const prompt = `You are an expert HR and resume parsing assistant. Extract all relevant details from the following resume text and respond ONLY with a raw valid JSON object (no markdown, no backticks, no explanations) matching this exact schema:
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "linkedinUrl": "string",
  "githubUrl": "string",
  "summary": "string",
  "skills": ["string"],
  "experience": [
    {
      "company": "string",
      "title": "string",
      "duration": "string",
      "responsibilities": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "year": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "url": "string"
    }
  ]
}

Resume text:
${resumeText}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        },
      );

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('No content returned from Gemini');

      return JSON.parse(rawText) as ParsedResumeResult;
    } catch (err: any) {
      this.logger.error(`Gemini parse error: ${err.message}`);
      return this.fallback(resumeText);
    }
  }

  private fallback(text: string): ParsedResumeResult {
    return {
      summary: text.slice(0, 300),
      skills: [],
      experience: [],
      education: [],
      projects: [],
    };
  }
}

