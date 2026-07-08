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
exports.LiteLLMController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const litellm_service_1 = require("./litellm.service");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const litellm_dto_1 = require("./dto/litellm.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
let LiteLLMController = class LiteLLMController {
    litellm;
    constructor(litellm) {
        this.litellm = litellm;
    }
    async health() {
        return this.litellm.getHealth();
    }
    async liveness() {
        return this.litellm.getLiveness();
    }
    async readiness() {
        return this.litellm.getReadiness();
    }
    async version() {
        return this.litellm.getVersion();
    }
    async models(_query) {
        return this.litellm.getModels();
    }
    async reload() {
        return this.litellm.reload();
    }
    async sync(dto) {
        return this.litellm.sync(dto.entityType, "manual");
    }
    async metrics() {
        return this.litellm.getMetrics();
    }
    async status() {
        return this.litellm.getStatus();
    }
    async config() {
        const c = this.litellm.getConfig();
        return {
            baseUrl: c.baseUrl,
            requestTimeoutMs: c.requestTimeoutMs,
            streamTimeoutMs: c.streamTimeoutMs,
            syncIntervalMinutes: c.syncIntervalMinutes,
            healthCheckIntervalMs: c.healthCheckIntervalMs,
            cacheTtlSeconds: c.cacheTtlSeconds,
            circuitBreakerFailureThreshold: c.circuitBreakerFailureThreshold,
            circuitBreakerResetTimeoutMs: c.circuitBreakerResetTimeoutMs,
            retryAttempts: c.retryAttempts,
            retryBaseDelayMs: c.retryBaseDelayMs,
            poolMaxConnections: c.poolMaxConnections,
        };
    }
    async callback(body) {
        return { received: true, body };
    }
};
exports.LiteLLMController = LiteLLMController;
__decorate([
    (0, common_1.Get)("health"),
    (0, permissions_decorator_1.RequirePermissions)("litellm:read"),
    (0, swagger_1.ApiOperation)({ summary: "Get LiteLLM proxy health (all endpoints healthy/unhealthy)" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LiteLLMController.prototype, "health", null);
__decorate([
    (0, common_1.Get)("health/liveness"),
    (0, permissions_decorator_1.RequirePermissions)("litellm:read"),
    (0, swagger_1.ApiOperation)({ summary: "LiteLLM liveness probe" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LiteLLMController.prototype, "liveness", null);
__decorate([
    (0, common_1.Get)("health/readiness"),
    (0, permissions_decorator_1.RequirePermissions)("litellm:read"),
    (0, swagger_1.ApiOperation)({ summary: "LiteLLM readiness probe" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LiteLLMController.prototype, "readiness", null);
__decorate([
    (0, common_1.Get)("version"),
    (0, permissions_decorator_1.RequirePermissions)("litellm:read"),
    (0, swagger_1.ApiOperation)({ summary: "Get LiteLLM proxy version" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LiteLLMController.prototype, "version", null);
__decorate([
    (0, common_1.Get)("models"),
    (0, permissions_decorator_1.RequirePermissions)("litellm:read"),
    (0, swagger_1.ApiOperation)({ summary: "List all models configured in LiteLLM (with caching)" }),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(litellm_dto_1.listModelsQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LiteLLMController.prototype, "models", null);
__decorate([
    (0, common_1.Post)("reload"),
    (0, permissions_decorator_1.RequirePermissions)("litellm:write"),
    (0, swagger_1.ApiOperation)({ summary: "Trigger LiteLLM config reload + invalidate caches" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LiteLLMController.prototype, "reload", null);
__decorate([
    (0, common_1.Post)("sync"),
    (0, permissions_decorator_1.RequirePermissions)("litellm:write"),
    (0, swagger_1.ApiOperation)({ summary: "Synchronize providers/models/capabilities from LiteLLM" }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(litellm_dto_1.syncSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LiteLLMController.prototype, "sync", null);
__decorate([
    (0, common_1.Get)("metrics"),
    (0, permissions_decorator_1.RequirePermissions)("litellm:read"),
    (0, swagger_1.ApiOperation)({ summary: "Aggregated LiteLLM metrics (provider counts, model counts, health, circuit breakers)" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LiteLLMController.prototype, "metrics", null);
__decorate([
    (0, common_1.Get)("status"),
    (0, permissions_decorator_1.RequirePermissions)("litellm:read"),
    (0, swagger_1.ApiOperation)({ summary: "Overall LiteLLM integration status (connectivity, version, last sync, circuit breakers)" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LiteLLMController.prototype, "status", null);
__decorate([
    (0, common_1.Get)("config"),
    (0, permissions_decorator_1.RequirePermissions)("litellm:read"),
    (0, swagger_1.ApiOperation)({ summary: "View the LiteLLM client configuration (no secrets)" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LiteLLMController.prototype, "config", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)("internal/callback"),
    (0, swagger_1.ApiOperation)({ summary: "Internal: callback endpoint for LiteLLM success/failure events" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LiteLLMController.prototype, "callback", null);
exports.LiteLLMController = LiteLLMController = __decorate([
    (0, swagger_1.ApiTags)("LiteLLM"),
    (0, common_1.Controller)("litellm"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [litellm_service_1.LiteLLMService])
], LiteLLMController);
//# sourceMappingURL=litellm.controller.js.map