import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchService } from '../search/search.service';
import { JobPlatform, NormalizedJobResult } from '../search/interfaces/search-provider.interface';
import { GetJobsQueryDto } from './dto/jobs.dto';

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly searchService: SearchService,
  ) {}

  async getJobs(userId: string, query: GetJobsQueryDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    const sixHoursAgo = new Date(Date.now() - CACHE_TTL_MS);
    const platformFilter = query.platform !== 'all' ? query.platform : undefined;

    // Check fresh DB cache (< 6 hours old)
    const freshCount = await this.prisma.job.count({
      where: {
        userId,
        ...(platformFilter ? { platform: platformFilter } : {}),
        fetchedAt: { gte: sixHoursAgo },
      },
    });

    let cacheHit = freshCount > 0 && query.refresh !== 'true';
    let activeProvider = this.searchService.getActiveProvider().name;
    let searchError: string | null = null;

    const shouldFetchLive =
      query.refresh === 'true' ||
      freshCount === 0;

    if (shouldFetchLive) {
      try {
        const platformsToQuery: JobPlatform[] = platformFilter
          ? [platformFilter]
          : ['greenhouse', 'lever', 'workable', 'wellfound', 'linkedin'];

        const searchRes = await this.searchService.searchJobs({
          query: query.q || profile?.role || 'Full Stack Developer',
          role: profile?.role || undefined,
          skills: profile?.skills || [],
          location: query.location || undefined,
          jobType: query.jobType || undefined,
          platforms: platformsToQuery,
        });

        activeProvider = searchRes.provider;
        await this.upsertJobsForUser(userId, searchRes.results, profile);
        cacheHit = false;
      } catch (err: any) {
        this.logger.error(`Live job search failed: ${err.message}`);
        searchError = err.message;
      }
    }

    // Build filtered Prisma query
    const whereClause: any = {
      userId,
      ...(platformFilter ? { platform: platformFilter } : {}),
      ...(query.location
        ? { location: { contains: query.location, mode: 'insensitive' } }
        : {}),
      ...(query.jobType && query.jobType !== 'all'
        ? { jobType: { contains: query.jobType, mode: 'insensitive' } }
        : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { company: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [jobs, total, platformCountsRaw, latestJob] = await Promise.all([
      this.prisma.job.findMany({
        where: whereClause,
        orderBy: [{ matchScore: 'desc' }, { fetchedAt: 'desc' }],
        skip,
        take: limit,
        include: {
          applications: {
            orderBy: { updatedAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.job.count({ where: whereClause }),
      this.prisma.job.groupBy({
        by: ['platform'],
        where: { userId },
        _count: { id: true },
      }),
      this.prisma.job.findFirst({
        where: { userId },
        orderBy: { fetchedAt: 'desc' },
        select: { fetchedAt: true },
      }),
    ]);

    const platformCounts: Record<string, number> = {
      greenhouse: 0,
      lever: 0,
      workable: 0,
      wellfound: 0,
      linkedin: 0,
    };
    for (const row of platformCountsRaw) {
      platformCounts[row.platform] = row._count.id;
    }

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      platformCounts,
      cacheHit,
      provider: activeProvider,
      lastSyncedAt: latestJob?.fetchedAt || null,
      searchError,
    };
  }

  async toggleSaveJob(userId: string, jobId: string) {
    const existing = await this.prisma.job.findFirst({
      where: { id: jobId, userId },
    });

    if (!existing) {
      throw new NotFoundException('Job not found');
    }

    const updated = await this.prisma.job.update({
      where: { id: jobId },
      data: { savedStatus: !existing.savedStatus },
    });

    return updated;
  }

  async getSavedJobs(userId: string) {
    const jobs = await this.prisma.job.findMany({
      where: { userId, savedStatus: true },
      orderBy: { updatedAt: 'desc' },
      include: {
        applications: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
    });
    return { jobs };
  }

  private async upsertJobsForUser(
    userId: string,
    results: NormalizedJobResult[],
    profile: { role?: string | null; skills?: string[] } | null,
  ) {
    const now = new Date();
    for (const item of results) {
      const matchScore = this.computeMatchScore(item, profile);
      await this.prisma.job.upsert({
        where: {
          userId_jobUrl: {
            userId,
            jobUrl: item.jobUrl,
          },
        },
        create: {
          userId,
          platform: item.platform,
          title: item.title,
          company: item.company,
          companyLogo: item.companyLogo || null,
          location: item.location || null,
          salary: item.salary || null,
          jobType: item.jobType || null,
          experienceLevel: item.experienceLevel || null,
          description: item.description || null,
          tags: item.tags,
          matchScore,
          jobUrl: item.jobUrl,
          sourceUrl: item.sourceUrl || item.jobUrl,
          fetchedAt: now,
        },
        update: {
          title: item.title,
          company: item.company,
          location: item.location || null,
          salary: item.salary || null,
          jobType: item.jobType || null,
          experienceLevel: item.experienceLevel || null,
          description: item.description || null,
          tags: item.tags,
          matchScore,
          fetchedAt: now,
        },
      });
    }
  }

  private computeMatchScore(
    job: NormalizedJobResult,
    profile: { role?: string | null; skills?: string[] } | null,
  ): number {
    if (!profile) return 68;

    let score = 55;
    const jobText = `${job.title} ${job.description || ''} ${job.tags.join(' ')}`.toLowerCase();

    // Role match (+20 max)
    if (profile.role) {
      const roleTokens = profile.role
        .toLowerCase()
        .split(/[\s,/|-]+/)
        .filter((w) => w.length > 2);
      const roleMatches = roleTokens.filter((token) => job.title.toLowerCase().includes(token));
      if (roleMatches.length > 0) {
        score += Math.min(20, roleMatches.length * 8);
      }
    }

    // Skills overlap (+23 max)
    const userSkills = profile.skills || [];
    if (userSkills.length > 0) {
      const matchedSkills = userSkills.filter((s) => jobText.includes(s.toLowerCase()));
      const ratio = matchedSkills.length / Math.min(userSkills.length, 8);
      score += Math.round(ratio * 23);
    }

    return Math.min(98, Math.max(52, score));
  }
}

