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
exports.AlertsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const alerts_service_1 = require("./alerts.service");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AlertsController = class AlertsController {
    alerts;
    constructor(alerts) {
        this.alerts = alerts;
    }
    async getAlerts(status, severity, limit) {
        return this.alerts.getAlerts(status, severity, limit ? parseInt(limit) : 50);
    }
    async getRules(includeDisabled) {
        return this.alerts.getRules(includeDisabled === "true");
    }
    async createRule(dto) {
        return this.alerts.createRule(dto);
    }
    async updateRule(id, dto) {
        return this.alerts.updateRule(id, dto);
    }
    async deleteRule(id) {
        return this.alerts.deleteRule(id);
    }
    async acknowledge(id, user) {
        await this.alerts.acknowledgeAlert(id, user.id);
        return { message: "Alert acknowledged" };
    }
    async resolve(id, user, reason) {
        await this.alerts.resolveAlert(id, user.id, reason);
        return { message: "Alert resolved" };
    }
    async evaluate() {
        return this.alerts.evaluateAlerts();
    }
};
exports.AlertsController = AlertsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)("alerts:read"),
    (0, swagger_1.ApiOperation)({ summary: "List alerts (filterable by status, severity)" }),
    __param(0, (0, common_1.Query)("status")),
    __param(1, (0, common_1.Query)("severity")),
    __param(2, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "getAlerts", null);
__decorate([
    (0, common_1.Get)("rules"),
    (0, permissions_decorator_1.RequirePermissions)("alerts:read"),
    (0, swagger_1.ApiOperation)({ summary: "List alert rules" }),
    __param(0, (0, common_1.Query)("includeDisabled")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "getRules", null);
__decorate([
    (0, common_1.Post)("rules"),
    (0, permissions_decorator_1.RequirePermissions)("alerts:write"),
    (0, swagger_1.ApiOperation)({ summary: "Create an alert rule" }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(alerts_service_1.createAlertRuleSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "createRule", null);
__decorate([
    (0, common_1.Patch)("rules/:id"),
    (0, permissions_decorator_1.RequirePermissions)("alerts:write"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "updateRule", null);
__decorate([
    (0, common_1.Delete)("rules/:id"),
    (0, permissions_decorator_1.RequirePermissions)("alerts:write"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "deleteRule", null);
__decorate([
    (0, common_1.Post)(":id/acknowledge"),
    (0, permissions_decorator_1.RequirePermissions)("alerts:write"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "acknowledge", null);
__decorate([
    (0, common_1.Post)(":id/resolve"),
    (0, permissions_decorator_1.RequirePermissions)("alerts:write"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)("reason")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "resolve", null);
__decorate([
    (0, common_1.Post)("evaluate"),
    (0, permissions_decorator_1.RequirePermissions)("alerts:write"),
    (0, swagger_1.ApiOperation)({ summary: "Manually trigger alert evaluation" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "evaluate", null);
exports.AlertsController = AlertsController = __decorate([
    (0, swagger_1.ApiTags)("Alerts"),
    (0, common_1.Controller)("alerts"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [alerts_service_1.AlertsService])
], AlertsController);
//# sourceMappingURL=alerts.controller.js.map