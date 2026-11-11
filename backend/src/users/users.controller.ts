import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@GetUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Put('profile')
  async updateProfile(@GetUser() user: any, @Body() data: any) {
    return this.usersService.updateProfile(user.id, data);
  }

  @Post('resume/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'resumes'),
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname) || '.pdf';
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.includes('pdf')) {
          return cb(new BadRequestException('Only PDF files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadResume(
    @GetUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadAndParseResume(user.id, file);
  }
}

