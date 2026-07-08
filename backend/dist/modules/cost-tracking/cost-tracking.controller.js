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
exports.CostTrackingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cost_tracking_service_1 = require("./cost-tracking.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
let CostTrackingController = class CostTrackingController {
    costs;
    constructor(costs) {
        this.costs = costs;
    }
    async byProvider(startDate, endDate) {
        return this.costs.getCostByProvider(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
    async byUser(orgId, startDate, endDate) {
        return this.costs.getCostByUser(orgId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
    async byOrganization(startDate, endDate) {
        return this.costs.getCostByOrganization(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
    async byModel(startDate, endDate) {
        return this.costs.getCostByModel(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
    async daily(orgId, days) {
        return this.costs.getDailyCost(orgId, days ? parseInt(days) : 30);
    }
    async monthly(orgId, months) {
        return this.costs.getMonthlyCost(orgId, months ? parseInt(months) : 12);
    }
    async total(orgId) {
        return this.costs.getTotalCost(orgId);
    }
};
exports.CostTrackingController = CostTrackingController;
__decorate([
    (0, common_1.Get)("by-provider"),
    (0, permissions_decorator_1.RequirePermissions)("costs:read"),
    (0, swagger_1.ApiOperation)({ summary: "Cost by provider (estimated vs real)" }),
    __param(0, (0, common_1.Query)("startDate")),
    __param(1, (0, common_1.Query)("endDate")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CostTrackingController.prototype, "byProvider", null);
__decorate([
    (0, common_1.Get)("by-user"),
    (0, permissions_decorator_1.RequirePermissions)("costs:read"),
    __param(0, (0, common_1.Query)("organizationId")),
    __param(1, (0, common_1.Query)("startDate")),
    __param(2, (0, common_1.Query)("endDate")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CostTrackingController.prototype, "byUser", null);
__decorate([
    (0, common_1.Get)("by-organization"),
    (0, permissions_decorator_1.RequirePermissions)("costs:read"),
    __param(0, (0, common_1.Query)("startDate")),
    __param(1, (0, common_1.Query)("endDate")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CostTrackingController.prototype, "byOrganization", null);
__decorate([
    (0, common_1.Get)("by-model"),
    (0, permissions_decorator_1.RequirePermissions)("costs:read"),
    __param(0, (0, common_1.Query)("startDate")),
    __param(1, (0, common_1.Query)("endDate")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CostTrackingController.prototype, "byModel", null);
__decorate([
    (0, common_1.Get)("daily"),
    (0, permissions_decorator_1.RequirePermissions)("costs:read"),
    __param(0, (0, common_1.Query)("organizationId")),
    __param(1, (0, common_1.Query)("days")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CostTrackingController.prototype, "daily", null);
__decorate([
    (0, common_1.Get)("monthly"),
    (0, permissions_decorator_1.RequirePermissions)("costs:read"),
    __param(0, (0, common_1.Query)("organizationId")),
    __param(1, (0, common_1.Query)("months")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CostTrackingController.prototype, "monthly", null);
__decorate([
    (0, common_1.Get)("total"),
    (0, permissions_decorator_1.RequirePermissions)("costs:read"),
    __param(0, (0, common_1.Query)("organizationId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CostTrackingController.prototype, "total", null);
exports.CostTrackingController = CostTrackingController = __decorate([
    (0, swagger_1.ApiTags)("Cost Tracking"),
    (0, common_1.Controller)("costs"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [cost_tracking_service_1.CostTrackingService])
], CostTrackingController);
//# sourceMappingURL=cost-tracking.controller.js.map