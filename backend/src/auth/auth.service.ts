import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  ResendOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private generate6DigitOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      if (!existing.isVerified) {
        // User exists but haven't verified yet - refresh OTP
        const otpCode = this.generate6DigitOtp();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await this.prisma.user.update({
          where: { id: existing.id },
          data: { otpCode, otpExpiresAt },
        });

        await this.mailService.sendOtpEmail(existing.email, otpCode);

        return {
          requiresOtp: true,
          email: existing.email,
          message: 'Verification code resent. Please check your email.',
        };
      }
      throw new ConflictException('An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);
    const otpCode = this.generate6DigitOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          isVerified: false,
          otpCode,
          otpExpiresAt,
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
      });

      // Send OTP via SMTP (or log to console in dev mode)
      await this.mailService.sendOtpEmail(user.email, otpCode);

      return {
        requiresOtp: true,
        email: user.email,
        message: 'A 6-digit confirmation code has been sent to your email.',
      };
    } catch (err: any) {
      throw new InternalServerErrorException(
        `Failed to register user: ${err.message}`,
      );
    }
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        profile: true,
        subscription: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User account not found.');
    }

    if (user.isVerified) {
      const token = this.generateToken(user.id, user.email);
      const { passwordHash: _, otpCode: __, ...safeUser } = user;
      return {
        message: 'Account is already verified.',
        user: safeUser,
        accessToken: token,
      };
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      throw new BadRequestException('No verification code requested.');
    }

    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }

    if (user.otpCode !== dto.otp) {
      throw new BadRequestException('Invalid verification code.');
    }

    // Mark verified and clear OTP
    const verifiedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiresAt: null,
      },
      include: {
        profile: true,
        subscription: true,
      },
    });

    const token = this.generateToken(verifiedUser.id, verifiedUser.email);
    const { passwordHash: _, otpCode: __, ...safeUser } = verifiedUser;

    return {
      message: 'Email verified successfully!',
      user: safeUser,
      accessToken: token,
    };
  }

  async resendOtp(dto: ResendOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException('User account not found.');
    }

    if (user.isVerified) {
      throw new BadRequestException('Account is already verified.');
    }

    const otpCode = this.generate6DigitOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiresAt },
    });

    await this.mailService.sendOtpEmail(user.email, otpCode);

    return {
      message: 'A fresh verification code has been sent to your email.',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Don't leak if email exists or not, but if found, generate OTP
    if (user) {
      const otpCode = this.generate6DigitOtp();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await this.prisma.user.update({
        where: { id: user.id },
        data: { otpCode, otpExpiresAt },
      });

      await this.mailService.sendPasswordResetEmail(user.email, otpCode);
    }

    return {
      message: 'If an account exists with this email, a 6-digit reset code has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !user.otpCode || !user.otpExpiresAt) {
      throw new BadRequestException('Invalid or expired reset code.');
    }

    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestException('Reset code has expired. Please request a new one.');
    }

    if (user.otpCode !== dto.otp) {
      throw new BadRequestException('Invalid 6-digit verification code.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.newPassword, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        otpCode: null,
        otpExpiresAt: null,
        isVerified: true, // Resetting via email verifies the account
      },
    });

    return {
      message: 'Password reset successful! You can now log in with your new password.',
    };
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

    // If registered via email but not verified yet, require OTP confirmation
    if (!user.isVerified && !user.googleId) {
      const otpCode = this.generate6DigitOtp();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { otpCode, otpExpiresAt },
      });

      await this.mailService.sendOtpEmail(user.email, otpCode);

      return {
        requiresOtp: true,
        email: user.email,
        message: 'Please verify your email address to log in.',
      };
    }

    const token = this.generateToken(user.id, user.email);
    const { passwordHash: _, otpCode: __, ...safeUser } = user;

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
          isVerified: true, // Google accounts are pre-verified
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
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.googleId,
          isVerified: true,
        },
        include: {
          profile: true,
          subscription: true,
        },
      });
    }

    const token = this.generateToken(user.id, user.email);
    const { passwordHash: _, otpCode: __, ...safeUser } = user;

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
