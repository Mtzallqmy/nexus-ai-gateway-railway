"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const schedule_1 = require("@nestjs/schedule");
const prisma_module_1 = require("./infrastructure/prisma/prisma.module");
const redis_module_1 = require("./infrastructure/redis/redis.module");
const queue_module_1 = require("./infrastructure/queue/queue.module");
const logging_module_1 = require("./infrastructure/logging/logging.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const timeout_interceptor_1 = require("./common/interceptors/timeout.interceptor");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const organizations_module_1 = require("./modules/organizations/organizations.module");
const teams_module_1 = require("./modules/teams/teams.module");
const projects_module_1 = require("./modules/projects/projects.module");
const roles_module_1 = require("./modules/roles/roles.module");
const permissions_module_1 = require("./modules/permissions/permissions.module");
const api_keys_module_1 = require("./modules/api-keys/api-keys.module");
const audit_logs_module_1 = require("./modules/audit-logs/audit-logs.module");
const sessions_module_1 = require("./modules/sessions/sessions.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const settings_module_1 = require("./modules/settings/settings.module");
const health_module_1 = require("./modules/health/health.module");
const metrics_module_1 = require("./modules/metrics/metrics.module");
const litellm_module_1 = require("./modules/litellm/litellm.module");
const providers_module_1 = require("./modules/providers/providers.module");
const ai_module_1 = require("./modules/ai/ai.module");
const playground_module_1 = require("./modules/playground/playground.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const usage_module_1 = require("./modules/usage/usage.module");
const cost_tracking_module_1 = require("./modules/cost-tracking/cost-tracking.module");
const billing_module_1 = require("./modules/billing/billing.module");
const monitoring_module_1 = require("./modules/monitoring/monitoring.module");
const alerts_module_1 = require("./modules/alerts/alerts.module");
const reporting_module_1 = require("./modules/reporting/reporting.module");
const admin_module_1 = require("./modules/admin/admin.module");
const jobs_module_1 = require("./modules/jobs/jobs.module");
const security_module_1 = require("./modules/security/security.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            schedule_1.ScheduleModule.forRoot(),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60_000,
                    limit: 100,
                },
            ]),
            logging_module_1.LoggingModule,
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            queue_module_1.QueueModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            organizations_module_1.OrganizationsModule,
            teams_module_1.TeamsModule,
            projects_module_1.ProjectsModule,
            roles_module_1.RolesModule,
            permissions_module_1.PermissionsModule,
            api_keys_module_1.ApiKeysModule,
            audit_logs_module_1.AuditLogsModule,
            sessions_module_1.SessionsModule,
            notifications_module_1.NotificationsModule,
            settings_module_1.SettingsModule,
            health_module_1.HealthModule,
            metrics_module_1.MetricsModule,
            litellm_module_1.LiteLLMModule,
            providers_module_1.ProvidersModule,
            ai_module_1.AiModule,
            playground_module_1.PlaygroundModule,
            analytics_module_1.AnalyticsModule,
            usage_module_1.UsageModule,
            cost_tracking_module_1.CostTrackingModule,
            billing_module_1.BillingModule,
            monitoring_module_1.MonitoringModule,
            alerts_module_1.AlertsModule,
            reporting_module_1.ReportingModule,
            admin_module_1.AdminModule,
            jobs_module_1.JobsModule,
            security_module_1.SecurityModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            { provide: core_1.APP_FILTER, useClass: all_exceptions_filter_1.AllExceptionsFilter },
            { provide: core_1.APP_INTERCEPTOR, useClass: logging_interceptor_1.LoggingInterceptor },
            { provide: core_1.APP_INTERCEPTOR, useClass: timeout_interceptor_1.TimeoutInterceptor },
            { provide: core_1.APP_INTERCEPTOR, useClass: transform_interceptor_1.TransformInterceptor },
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map