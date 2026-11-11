import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { GetJobsQueryDto, GetJobsQuerySchema } from './dto/jobs.dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async getJobs(
    @GetUser() user: any,
    @Query(new ZodValidationPipe(GetJobsQuerySchema)) query: GetJobsQueryDto,
  ) {
    return this.jobsService.getJobs(user.id, query);
  }

  @Get('saved')
  async getSavedJobs(@GetUser() user: any) {
    return this.jobsService.getSavedJobs(user.id);
  }

  @Patch(':id/save')
  async toggleSaveJob(@GetUser() user: any, @Param('id') jobId: string) {
    return this.jobsService.toggleSaveJob(user.id, jobId);
  }
}

