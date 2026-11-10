export interface ParsedResumeResult {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  summary?: string;
  skills: string[];
  experience: Array<{
    company: string;
    title: string;
    duration?: string;
    responsibilities?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    url?: string;
  }>;
}

export interface AiProvider {
  readonly name: string;
  parseResume(resumeText: string): Promise<ParsedResumeResult>;
  generateText?(prompt: string): Promise<string>;
}

