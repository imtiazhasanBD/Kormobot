import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import * as fs from 'fs';
import * as path from 'path';
const pdfParse = require('pdf-parse');

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        credits: true,
        resumes: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return {
      user,
      profile,
    };
  }

  async updateProfile(userId: string, data: any) {
    return this.prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        fullName: data.fullName,
        phone: data.phone,
        location: data.location,
        role: data.role,
        summary: data.summary,
        skills: data.skills || [],
        experience: data.experience || [],
        education: data.education || [],
        projects: data.projects || [],
        links: data.links || {},
        preferredLanguage: data.preferredLanguage || 'en',
        discordWebhook: data.discordWebhook,
      },
      update: {
        ...(data.fullName !== undefined && { fullName: data.fullName }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.summary !== undefined && { summary: data.summary }),
        ...(data.skills !== undefined && { skills: data.skills }),
        ...(data.experience !== undefined && { experience: data.experience }),
        ...(data.education !== undefined && { education: data.education }),
        ...(data.projects !== undefined && { projects: data.projects }),
        ...(data.links !== undefined && { links: data.links }),
        ...(data.preferredLanguage !== undefined && { preferredLanguage: data.preferredLanguage }),
        ...(data.discordWebhook !== undefined && { discordWebhook: data.discordWebhook }),
      },
    });
  }

  async uploadAndParseResume(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No resume file provided');
    }

    if (!file.mimetype.includes('pdf')) {
      throw new BadRequestException('Only PDF resumes are supported');
    }

    try {
      // 1. Extract text using pdf-parse
      const dataBuffer = fs.readFileSync(file.path);
      const parsedPdf = await pdfParse(dataBuffer);
      const extractedText = parsedPdf.text || '';

      if (!extractedText.trim()) {
        throw new BadRequestException('Could not extract readable text from PDF');
      }

      // 2. Save record in database
      const fileUrl = `/uploads/resumes/${path.basename(file.path)}`;
      const resume = await this.prisma.resume.create({
        data: {
          userId,
          fileName: file.originalname,
          fileUrl,
        },
      });

      // 3. AI parsing of resume text
      const parsedData = await this.aiService.parseResume(extractedText);

      // 4. Upsert User Profile with parsed data
      const updatedProfile = await this.prisma.profile.upsert({
        where: { userId },
        create: {
          userId,
          fullName: parsedData.fullName || null,
          phone: parsedData.phone || null,
          location: parsedData.location || null,
          role: parsedData.experience?.[0]?.title || null,
          summary: parsedData.summary || null,
          skills: parsedData.skills || [],
          experience: parsedData.experience || [],
          education: parsedData.education || [],
          projects: parsedData.projects || [],
          links: {
            linkedin: parsedData.linkedinUrl || '',
            github: parsedData.githubUrl || '',
          },
        },
        update: {
          ...(parsedData.fullName && { fullName: parsedData.fullName }),
          ...(parsedData.phone && { phone: parsedData.phone }),
          ...(parsedData.location && { location: parsedData.location }),
          ...(parsedData.summary && { summary: parsedData.summary }),
          ...(parsedData.skills && parsedData.skills.length > 0 && { skills: parsedData.skills }),
          ...(parsedData.experience && { experience: parsedData.experience }),
          ...(parsedData.education && { education: parsedData.education }),
          ...(parsedData.projects && { projects: parsedData.projects }),
          links: {
            linkedin: parsedData.linkedinUrl || '',
            github: parsedData.githubUrl || '',
          },
        },
      });

      return {
        message: 'Resume uploaded and parsed successfully',
        resume,
        parsedData,
        profile: updatedProfile,
      };
    } catch (err: any) {
      this.logger.error(`Failed to parse resume: ${err.message}`, err.stack);
      throw new BadRequestException(`Failed to parse resume: ${err.message}`);
    }
  }
}

