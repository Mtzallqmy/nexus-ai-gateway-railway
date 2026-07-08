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
exports.ProvidersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const providers_service_1 = require("./providers.service");
const provider_dto_1 = require("./dto/provider.dto");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
let ProvidersController = class ProvidersController {
    providers;
    constructor(providers) {
        this.providers = providers;
    }
    async findAll(query) {
        return this.providers.findAll(query);
    }
    async getCatalog() {
        return this.providers.getCatalog();
    }
    async findBySlug(slug) {
        return this.providers.findBySlug(slug);
    }
    async validateApiKey(dto) {
        return this.providers.validateApiKey(dto);
    }
    async validationHistory(providerName, limit) {
        return this.providers.getValidationHistory(providerName, limit ? parseInt(limit) : 20);
    }
    async discover(dto) {
        return this.providers.discoverProvider(dto);
    }
    async discoveryResults() {
        return this.providers.getAllDiscoveryResults();
    }
    async discoveryResult(providerName) {
        return this.providers.getDiscoveryResult(providerName);
    }
    async health(providerName) {
        return this.providers.getProviderHealth(providerName);
    }
    async runHealthCheck(providerName) {
        return this.providers.runHealthCheck(providerName);
    }
    async statistics(providerName) {
        return this.providers.getStatistics(providerName);
    }
    async analytics(query) {
        return this.providers.getAnalytics(query);
    }
    async logs(query) {
        return this.providers.getLogs(query);
    }
    async dashboard() {
        return this.providers.getDashboard();
    }
};
exports.ProvidersController = ProvidersController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)("providers:read"),
    (0, swagger_1.ApiOperation)({ summary: "List all providers in the registry (paginated, filterable, searchable)" }),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(provider_dto_1.listProvidersQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("catalog"),
    (0, permissions_decorator_1.RequirePermissions)("providers:read"),
    (0, swagger_1.ApiOperation)({ summary: "Get the static provider catalog (all 20+ supported providers)" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "getCatalog", null);
__decorate([
    (0, common_1.Get)(":slug"),
    (0, permissions_decorator_1.RequirePermissions)("providers:read"),
    (0, swagger_1.ApiOperation)({ summary: "Get a single provider by slug" }),
    __param(0, (0, common_1.Param)("slug")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Post)("validate-key"),
    (0, permissions_decorator_1.RequirePermissions)("providers:write"),
    (0, swagger_1.ApiOperation)({ summary: "Validate an API key via REAL request through LiteLLM (never faked)" }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(provider_dto_1.validateApiKeySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "validateApiKey", null);
__decorate([
    (0, common_1.Get)("validation-history/:providerName?"),
    (0, permissions_decorator_1.RequirePermissions)("providers:read"),
    (0, swagger_1.ApiOperation)({ summary: "Get API key validation history" }),
    __param(0, (0, common_1.Param)("providerName")),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "validationHistory", null);
__decorate([
    (0, common_1.Post)("discover"),
    (0, permissions_decorator_1.RequirePermissions)("providers:write"),
    (0, swagger_1.ApiOperation)({ summary: "Discover provider capabilities via REAL requests (auto-detect models, vision, audio, etc.)" }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(provider_dto_1.discoverProviderSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "discover", null);
__decorate([
    (0, common_1.Get)("discovery/results"),
    (0, permissions_decorator_1.RequirePermissions)("providers:read"),
    (0, swagger_1.ApiOperation)({ summary: "Get discovery results for all providers" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "discoveryResults", null);
__decorate([
    (0, common_1.Get)("discovery/:providerName"),
    (0, permissions_decorator_1.RequirePermissions)("providers:read"),
    (0, swagger_1.ApiOperation)({ summary: "Get discovery result for a specific provider" }),
    __param(0, (0, common_1.Param)("providerName")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "discoveryResult", null);
__decorate([
    (0, common_1.Get)("health/:providerName?"),
    (0, permissions_decorator_1.RequirePermissions)("providers:read"),
    (0, swagger_1.ApiOperation)({ summary: "Get provider health status" }),
    __param(0, (0, common_1.Param)("providerName")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "health", null);
__decorate([
    (0, common_1.Post)("health-check"),
    (0, permissions_decorator_1.RequirePermissions)("providers:write"),
    (0, swagger_1.ApiOperation)({ summary: "Run a health check (triggered manually)" }),
    __param(0, (0, common_1.Body)("providerName")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "runHealthCheck", null);
__decorate([
    (0, common_1.Get)("statistics/:providerName?"),
    (0, permissions_decorator_1.RequirePermissions)("providers:read"),
    (0, swagger_1.ApiOperation)({ summary: "Get provider statistics (requests, errors, tokens, cost, latency)" }),
    __param(0, (0, common_1.Param)("providerName")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "statistics", null);
__decorate([
    (0, common_1.Get)("analytics"),
    (0, permissions_decorator_1.RequirePermissions)("providers:read"),
    (0, swagger_1.ApiOperation)({ summary: "Get provider analytics (timeline + per-provider breakdown)" }),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(provider_dto_1.providerAnalyticsQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "analytics", null);
__decorate([
    (0, common_1.Get)("logs"),
    (0, permissions_decorator_1.RequirePermissions)("providers:read"),
    (0, swagger_1.ApiOperation)({ summary: "Get provider logs (paginated, filterable, sortable)" }),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(provider_dto_1.providerLogsQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "logs", null);
__decorate([
    (0, common_1.Get)("dashboard/overview"),
    (0, permissions_decorator_1.RequirePermissions)("providers:read"),
    (0, swagger_1.ApiOperation)({ summary: "Get provider dashboard overview (summary + recent validations + recent logs)" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "dashboard", null);
exports.ProvidersController = ProvidersController = __decorate([
    (0, swagger_1.ApiTags)("Providers"),
    (0, common_1.Controller)("providers"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [providers_service_1.ProvidersService])
], ProvidersController);
//# sourceMappingURL=providers.controller.js.map