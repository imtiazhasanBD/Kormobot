import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          profile: {
            create: {
              fullName: dto.fullName || dto.email.split('@')[0],
              preferredLanguage: 'en',
            },
          },
          subscription: {
            create: {
              planName: 'free',
              planLimit: 5,
              status: 'active',
              dailyUsageCount: 0,
            },
          },
        },
        include: {
          profile: true,
          subscription: true,
        },
      });

      const token = this.generateToken(user.id, user.email);
      const { passwordHash: _, ...safeUser } = user;

      return {
        message: 'Registration successful',
        user: safeUser,
        accessToken: token,
      };
    } catch (err: any) {
      throw new InternalServerErrorException(
        `Failed to register user: ${err.message}`,
      );
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        profile: true,
        subscription: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const token = this.generateToken(user.id, user.email);
    const { passwordHash: _, ...safeUser } = user;

    return {
      message: 'Login successful',
      user: safeUser,
      accessToken: token,
    };
  }

  async validateGoogleUser(googleUser: {
    googleId: string;
    email: string;
    fullName?: string;
  }) {
    if (!googleUser.email) {
      throw new UnauthorizedException('Google account did not provide an email.');
    }

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.googleId },
          { email: googleUser.email.toLowerCase() },
        ],
      },
      include: {
        profile: true,
        subscription: true,
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email.toLowerCase(),
          googleId: googleUser.googleId,
          profile: {
            create: {
              fullName: googleUser.fullName || googleUser.email.split('@')[0],
              preferredLanguage: 'en',
            },
          },
          subscription: {
            create: {
              planName: 'free',
              planLimit: 5,
              status: 'active',
              dailyUsageCount: 0,
            },
          },
        },
        include: {
          profile: true,
          subscription: true,
        },
      });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleUser.googleId },
        include: {
          profile: true,
          subscription: true,
        },
      });
    }

    const token = this.generateToken(user.id, user.email);
    const { passwordHash: _, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken: token,
    };
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email },
      {
        secret: process.env.JWT_SECRET || 'super-secret-jwt-key-jobbuddy-ai',
        expiresIn: '7d',
      },
    );
  }
}

