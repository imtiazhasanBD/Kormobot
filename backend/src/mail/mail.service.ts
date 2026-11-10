import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.MAIL_HOST || process.env.SMTP_HOST;
    const port = Number(process.env.MAIL_PORT || process.env.SMTP_PORT) || 587;
    const user = process.env.MAIL_USER || process.env.SMTP_USER;
    const pass = process.env.MAIL_PASS || process.env.SMTP_PASS;

    if (host && user && pass) {
      const isGmail = host.includes('gmail.com');

      if (isGmail) {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass },
        });
        this.logger.log(`MailService configured with Gmail service for: ${user}`);
      } else {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });
        this.logger.log(`MailService configured with SMTP ${host}:${port}`);
      }
    } else {
      this.logger.warn(
        'Mail credentials not fully provided. OTPs will be logged to console in dev mode.',
      );
    }
  }

  private getFromAddress(): string {
    const appName = 'Kormobot AI';
    const user = process.env.MAIL_USER || process.env.SMTP_USER || '';
    const rawFrom = process.env.MAIL_FROM || process.env.SMTP_FROM;

    let from = `"${appName}" <${user}>`;
    if (rawFrom) {
      if (rawFrom.includes('<') && rawFrom.includes('>')) {
        from = rawFrom;
      } else if (rawFrom.includes('@')) {
        const parts = rawFrom.trim().split(/\s+/);
        const emailPart = parts.pop();
        const namePart = parts.join(' ') || appName;
        from = `"${namePart}" <${emailPart}>`;
      }
    }
    return from;
  }

  async sendOtpEmail(email: string, otp: string): Promise<boolean> {
    const appName = 'Kormobot AI';
    const from = this.getFromAddress();

    if (!this.transporter) this.initTransporter();

    if (!this.transporter) {
      this.logger.log(
        `\n=========================================\n📧 [DEV MODE OTP EMAIL]\nTo: ${email}\nYour OTP Code: ${otp}\nValid for: 10 minutes\n=========================================\n`,
      );
      return true;
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to: email,
        subject: `${otp} is your ${appName} verification code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e5f1; border-radius: 8px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #371ee1; margin: 0; font-size: 22px;">${appName}</h2>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Autonomous AI Job Application Agent</p>
            </div>
            <p style="color: #0f172a; font-size: 15px; line-height: 1.5;">Hello,</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.5;">
              Thank you for signing up. Please enter the following 6-digit confirmation code to verify your email address:
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #371ee1; background-color: #eef0fe; padding: 12px 28px; border-radius: 6px; border: 1px solid #e0e2f5;">
                ${otp}
              </span>
            </div>
            <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
              This code will expire in 10 minutes. If you did not request this verification, you can safely ignore this email.
            </p>
          </div>
        `,
      });
      this.logger.log(`✅ Sent OTP email to ${email} (MessageId: ${info.messageId})`);
      return true;
    } catch (err: any) {
      this.logger.error(`❌ Failed to send OTP email to ${email}: ${err.message}`);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, otp: string): Promise<boolean> {
    const appName = 'Kormobot AI';
    const from = this.getFromAddress();

    if (!this.transporter) this.initTransporter();

    if (!this.transporter) {
      this.logger.log(
        `\n=========================================\n🔑 [DEV MODE PASSWORD RESET OTP]\nTo: ${email}\nReset Code: ${otp}\nValid for: 10 minutes\n=========================================\n`,
      );
      return true;
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to: email,
        subject: `${otp} is your ${appName} password reset code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e5f1; border-radius: 8px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #371ee1; margin: 0; font-size: 22px;">${appName}</h2>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Password Reset Request</p>
            </div>
            <p style="color: #0f172a; font-size: 15px; line-height: 1.5;">Hello,</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.5;">
              We received a request to reset your password. Please use the following 6-digit code to set a new password:
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #371ee1; background-color: #eef0fe; padding: 12px 28px; border-radius: 6px; border: 1px solid #e0e2f5;">
                ${otp}
              </span>
            </div>
            <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
              This code will expire in 10 minutes. If you did not ask to reset your password, please ignore this email or secure your account.
            </p>
          </div>
        `,
      });
      this.logger.log(`✅ Sent password reset email to ${email} (MessageId: ${info.messageId})`);
      return true;
    } catch (err: any) {
      this.logger.error(`❌ Failed to send password reset email to ${email}: ${err.message}`);
      return false;
    }
  }
}
