import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { AutomationModule } from './automation/automation.module';
import { BillingModule } from './billing/billing.module';
import { DiscordModule } from './discord/discord.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    JobsModule,
    AutomationModule,
    BillingModule,
    DiscordModule,
    SearchModule,
  ],
})
export class AppModule {}

