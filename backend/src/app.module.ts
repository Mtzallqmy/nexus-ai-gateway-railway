import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { ScheduleModule } from "@nestjs/schedule";

// Infrastructure
import { PrismaModule } from "./infrastructure/prisma/prisma.module";
import { RedisModule } from "./infrastructure/redis/redis.module";
import { QueueModule } from "./infrastructure/queue/queue.module";
import { LoggingModule } from "./infrastructure/logging/logging.module";

// Common
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { TimeoutInterceptor } from "./common/interceptors/timeout.interceptor";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";

// Feature modules
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { TeamsModule } from "./modules/teams/teams.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { RolesModule } from "./modules/roles/roles.module";
import { PermissionsModule } from "./modules/permissions/permissions.module";
import { ApiKeysModule } from "./modules/api-keys/api-keys.module";
import { AuditLogsModule } from "./modules/audit-logs/audit-logs.module";
import { SessionsModule } from "./modules/sessions/sessions.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { HealthModule } from "./modules/health/health.module";
import { MetricsModule } from "./modules/metrics/metrics.module";
import { LiteLLMModule } from "./modules/litellm/litellm.module";
import { ProvidersModule } from "./modules/providers/providers.module";
import { AiModule } from "./modules/ai/ai.module";
import { PlaygroundModule } from "./modules/playground/playground.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { UsageModule } from "./modules/usage/usage.module";
import { CostTrackingModule } from "./modules/cost-tracking/cost-tracking.module";
import { BillingModule } from "./modules/billing/billing.module";
import { MonitoringModule } from "./modules/monitoring/monitoring.module";
import { AlertsModule } from "./modules/alerts/alerts.module";
import { ReportingModule } from "./modules/reporting/reporting.module";
import { AdminModule } from "./modules/admin/admin.module";
import { JobsModule } from "./modules/jobs/jobs.module";
import { SecurityModule } from "./modules/security/security.module";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    // Global config
    ConfigModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),

    // Infrastructure (global)
    LoggingModule,
    PrismaModule,
    RedisModule,
    QueueModule,

    // Features
    AuthModule,
    UsersModule,
    OrganizationsModule,
    TeamsModule,
    ProjectsModule,
    RolesModule,
    PermissionsModule,
    ApiKeysModule,
    AuditLogsModule,
    SessionsModule,
    NotificationsModule,
    SettingsModule,
    HealthModule,
    MetricsModule,
    LiteLLMModule,
    ProvidersModule,
    AiModule,
    PlaygroundModule,
    AnalyticsModule,
    UsageModule,
    CostTrackingModule,
    BillingModule,
    MonitoringModule,
    AlertsModule,
    ReportingModule,
    AdminModule,
    JobsModule,
    SecurityModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global filters
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    // Global interceptors (order matters)
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    // Global auth guard — routes opt-out via @Public()
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
