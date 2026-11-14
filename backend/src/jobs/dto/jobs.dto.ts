import { z } from 'zod';

export const GetJobsQuerySchema = z.object({
  q: z.string().trim().optional(),
  platform: z
    .enum(['all', 'greenhouse', 'lever', 'workable', 'wellfound', 'linkedin', 'alljobs', 'bdjobs'])
    .optional()
    .default('all'),
  datePosted: z
    .enum(['all', '24h', 'week', 'month'])
    .optional()
    .default('all'),
  sortBy: z
    .enum(['match', 'recent'])
    .optional()
    .default('match'),
  location: z.string().trim().optional(),
  jobType: z.string().trim().optional(),
  refresh: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type GetJobsQueryDto = z.infer<typeof GetJobsQuerySchema>;

