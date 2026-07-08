"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const analytics_service_1 = require("./analytics.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const zod_1 = require("zod");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const analyticsQuerySchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    providerName: zod_1.z.string().optional(),
    modelName: zod_1.z.string().optional(),
    organizationId: zod_1.z.string().uuid().optional(),
    userId: zod_1.z.string().uuid().optional(),
    granularity: zod_1.z.enum(["hour", "day", "week", "month"]).default("day"),
});
let AnalyticsController = class AnalyticsController {
    analytics;
    constructor(analytics) {
        this.analytics = analytics;
    }
    async usage(query) {
        return this.analytics.getUsageAnalytics(query);
    }
    async requests(query) {
        return this.analytics.getRequestAnalytics(query);
    }
    async providers(query) {
        return this.analytics.getProviderAnalytics(query);
    }
    async models(query) {
        return this.analytics.getModelAnalytics(query);
    }
    async cost(query) {
        return this.analytics.getCostAnalytics(query);
    }
    async latency(query) {
        return this.analytics.getLatencyAnalytics(query);
    }
    async errors(query) {
        return this.analytics.getErrorAnalytics(query);
    }
    async users(query) {
        return this.analytics.getUserAnalytics(query);
    }
    async organizations(query) {
        return this.analytics.getOrganizationAnalytics(query);
    }
    async apiKeys(query) {
        return this.analytics.getApiAnalytics(query);
    }
    async executiveDashboard() {
        return this.analytics.getExecutiveDashboard();
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)("usage"),
    (0, permissions_decorator_1.RequirePermissions)("analytics:read"),
    (0, swagger_1.ApiOperation)({ summary: "Usage analytics — requests, tokens, streaming, images, embeddings, etc." }),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(analyticsQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "usage", null);
__decorate([
    (0, common_1.Get)("requests"),
    (0, permissions_decorator_1.RequirePermissions)("analytics:read"),
    (0, swagger_1.ApiOperation)({ summary: "Request analytics — by provider, model, endpoint, method" }),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(analyticsQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "requests", null);
__decorate([
    (0, common_1.Get)("providers"),
    (0, permissions_decorator_1.RequirePermissions)("analytics:read"),
    (0, swagger_1.ApiOperation)({ summary: "Provider analytics — per-provider requests, tokens, cost, errors, latency" }),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(analyticsQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "providers", null);
__decorate([
    (0, common_1.Get)("models"),
    (0, permissions_decorator_1.RequirePermissions)("analytics:read"),
    (0, swagger_1.ApiOperation)({ summary: "Model analytics — per-model requests, tokens, cost, latency" }),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(analyticsQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "models", null);
__decorate([
    (0, common_1.Get)("cost"),
    (0, permissions_decorator_1.RequirePermissions)("analytics:read"),
    (0, swagger_1.ApiOperation)({ summary: "Cost analytics — estimated vs real, by provider, by model" }),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(analyticsQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "cost", null);
__decorate([
    (0, common_1.Get)("latency"),
    (0, permissions_decorator_1.RequirePermissions)("analytics:read"),
    (0, swagger_1.ApiOperation)({ summary: "Latency analytics — avg, p50, p95, p99, by provider" }),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(analyticsQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "latency", null);
__decorate([
    (0, common_1.Get)("errors"),
    (0, permissions_decorator_1.RequirePermissions)("analytics:read"),
    (0, swagger_1.ApiOperation)({ summary: "Error analytics — error rate, success rate, failure rate" }),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(analyticsQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "errors", null);
__decorate([
    (0, common_1.Get)("users"),
    (0, permissions_decorator_1.RequirePermissions)("analytics:read"),
    (0, swagger_1.ApiOperation)({ summary: "User analytics — per-user requests, tokens, cost" }),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(analyticsQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "users", null);
__decorate([
    (0, common_1.Get)("organizations"),
    (0, permissions_decorator_1.RequirePermissions)("analytics:read"),
    (0, swagger_1.ApiOperation)({ summary: "Organization analytics — per-org requests, tokens, cost" }),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(analyticsQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "organizations", null);
__decorate([
    (0, common_1.Get)("api-keys"),
    (0, permissions_decorator_1.RequirePermissions)("analytics:read"),
    (0, swagger_1.ApiOperation)({ summary: "API key analytics — per-key requests, tokens, cost" }),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(analyticsQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "apiKeys", null);
__decorate([
    (0, common_1.Get)("executive-dashboard"),
    (0, permissions_decorator_1.RequirePermissions)("analytics:read"),
    (0, swagger_1.ApiOperation)({ summary: "Executive dashboard — 24h/7d/30d summary, top providers/models, alerts, revenue" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "executiveDashboard", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)("Analytics"),
    (0, common_1.Controller)("analytics"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map