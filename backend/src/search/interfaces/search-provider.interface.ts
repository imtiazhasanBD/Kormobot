export type JobPlatform =
  | 'greenhouse'
  | 'lever'
  | 'workable'
  | 'wellfound'
  | 'linkedin'
  | 'alljobs'
  | 'bdjobs';

export interface JobSearchQuery {
  query: string;
  role?: string;
  skills?: string[];
  location?: string;
  jobType?: string;
  platforms?: JobPlatform[];
  maxResults?: number;
}

export interface NormalizedJobResult {
  platform: JobPlatform;
  title: string;
  company: string;
  companyLogo?: string;
  location?: string;
  salary?: string;
  jobType?: string;
  experienceLevel?: string;
  description?: string;
  tags: string[];
  jobUrl: string;
  sourceUrl?: string;
}

export interface SearchProvider {
  readonly name: string;
  searchJobs(params: JobSearchQuery): Promise<NormalizedJobResult[]>;
}

