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
exports.UsageController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const usage_service_1 = require("./usage.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const zod_1 = require("zod");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const usageQuerySchema = zod_1.z.object({
    organizationId: zod_1.z.string().uuid().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
let UsageController = class UsageController {
    usage;
    constructor(usage) {
        this.usage = usage;
    }
    async summary(query) {
        return this.usage.getUsageSummary(query.organizationId, query.startDate ? new Date(query.startDate) : undefined, query.endDate ? new Date(query.endDate) : undefined);
    }
    async byType(query) {
        return this.usage.getUsageByType(query.organizationId, query.startDate ? new Date(query.startDate) : undefined, query.endDate ? new Date(query.endDate) : undefined);
    }
};
exports.UsageController = UsageController;
__decorate([
    (0, common_1.Get)("summary"),
    (0, permissions_decorator_1.RequirePermissions)("usage:read"),
    (0, swagger_1.ApiOperation)({ summary: "Usage summary — requests, tokens, cost, errors" }),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(usageQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsageController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)("by-type"),
    (0, permissions_decorator_1.RequirePermissions)("usage:read"),
    (0, swagger_1.ApiOperation)({ summary: "Usage by type — streaming, images, embeddings, speech, vision, moderation" }),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(usageQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsageController.prototype, "byType", null);
exports.UsageController = UsageController = __decorate([
    (0, swagger_1.ApiTags)("Usage"),
    (0, common_1.Controller)("usage"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [usage_service_1.UsageService])
], UsageController);
//# sourceMappingURL=usage.controller.js.map