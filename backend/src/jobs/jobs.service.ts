import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchService } from '../search/search.service';
import { JobPlatform, NormalizedJobResult } from '../search/interfaces/search-provider.interface';
import { enrichJobsWithLogos } from '../search/utils/logo-resolver';
import { isJobCompatibleWithProfile, computeJobMatchScore } from '../search/utils/job-matching';
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
        isClosed: false,
        matchScore: { gte: 45 },
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
          : ['greenhouse', 'lever', 'workable', 'wellfound', 'linkedin', 'alljobs', 'bdjobs'];

        const searchRes = await this.searchService.searchJobs({
          query: query.q || profile?.role || 'Full Stack Developer',
          role: profile?.role || undefined,
          skills: profile?.skills || [],
          location: query.location || undefined,
          jobType: query.jobType || undefined,
          platforms: platformsToQuery,
        });

        activeProvider = searchRes.provider;
        const enrichedResults = await enrichJobsWithLogos(searchRes.results);
        await this.upsertJobsForUser(userId, enrichedResults, profile);
        cacheHit = false;
      } catch (err: any) {
        this.logger.error(`Live job search failed: ${err.message}`);
        searchError = err.message;
      }
    }

    // Build filtered Prisma query
    const whereClause: any = {
      userId,
      isClosed: false,
      ...(platformFilter ? { platform: platformFilter } : {}),
      ...(!query.q ? { matchScore: { gte: 45 } } : {}),
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

    if (query.datePosted && query.datePosted !== 'all') {
      const now = Date.now();
      let threshold: Date | null = null;
      if (query.datePosted === '24h') {
        threshold = new Date(now - 24 * 60 * 60 * 1000);
      } else if (query.datePosted === 'week') {
        threshold = new Date(now - 7 * 24 * 60 * 60 * 1000);
      } else if (query.datePosted === 'month') {
        threshold = new Date(now - 30 * 24 * 60 * 60 * 1000);
      }

      if (threshold) {
        whereClause.AND = [
          ...(whereClause.AND || []),
          {
            OR: [
              { postedAt: { gte: threshold } },
              { AND: [{ postedAt: null }, { createdAt: { gte: threshold } }] },
            ],
          },
        ];
      }
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const orderByClause: any[] =
      query.sortBy === 'recent'
        ? [{ postedAt: 'desc' }, { fetchedAt: 'desc' }, { matchScore: 'desc' }]
        : [{ matchScore: 'desc' }, { postedAt: 'desc' }, { fetchedAt: 'desc' }];

    const [jobs, total, platformCountsRaw, latestJob] = await Promise.all([
      this.prisma.job.findMany({
        where: whereClause,
        orderBy: orderByClause,
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
        where: { userId, isClosed: false, matchScore: { gte: 45 } } as any,
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
      alljobs: 0,
      bdjobs: 0,
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
      if (item.isClosed) {
        // If closed, update any existing records to isClosed: true so they disappear from active feed
        await this.prisma.job.updateMany({
          where: {
            userId,
            jobUrl: item.jobUrl,
          },
          data: { isClosed: true },
        });
        continue;
      }

      // Check profile compatibility (excludes non-tech & completely mismatched specialized stacks)
      const compatibility = isJobCompatibleWithProfile(item, profile);
      if (!compatibility.compatible) {
        // If it was in the database and not saved, delete it so it never shows in active feed
        await this.prisma.job.deleteMany({
          where: {
            userId,
            jobUrl: item.jobUrl,
            savedStatus: false,
          },
        });
        continue;
      }

      const matchScore = computeJobMatchScore(item, profile);
      const parsedPostedAt = item.postedAt ? new Date(item.postedAt) : null;
      const validPostedAt =
        parsedPostedAt && !isNaN(parsedPostedAt.getTime()) ? parsedPostedAt : null;

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
          isClosed: false,
          postedAt: validPostedAt || now,
          jobUrl: item.jobUrl,
          sourceUrl: item.sourceUrl || item.jobUrl,
          fetchedAt: now,
        },
        update: {
          title: item.title,
          company: item.company,
          ...(item.companyLogo ? { companyLogo: item.companyLogo } : {}),
          location: item.location || null,
          salary: item.salary || null,
          jobType: item.jobType || null,
          experienceLevel: item.experienceLevel || null,
          description: item.description || null,
          tags: item.tags,
          matchScore,
          isClosed: false,
          ...(parsedPostedAt && !isNaN(parsedPostedAt.getTime())
            ? { postedAt: parsedPostedAt }
            : {}),
          fetchedAt: now,
        },
      });
    }
  }
}

