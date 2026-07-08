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
exports.ReportingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reporting_service_1 = require("./reporting.service");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ReportingController = class ReportingController {
    reporting;
    constructor(reporting) {
        this.reporting = reporting;
    }
    async generate(dto, user) {
        return this.reporting.createReport(dto, user.id);
    }
    async getReports(orgId, limit) {
        return this.reporting.getReports(orgId, limit ? parseInt(limit) : 50);
    }
    async getReport(id) {
        return this.reporting.getReport(id);
    }
    async getScheduled(orgId) {
        return this.reporting.getScheduledReports(orgId);
    }
    async createScheduled(body) {
        return this.reporting.createScheduledReport(body);
    }
    async deleteScheduled(id) {
        return this.reporting.deleteScheduledReport(id);
    }
};
exports.ReportingController = ReportingController;
__decorate([
    (0, common_1.Post)("generate"),
    (0, permissions_decorator_1.RequirePermissions)("reports:write"),
    (0, swagger_1.ApiOperation)({ summary: "Generate a report (CSV, Excel, PDF, JSON)" }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(reporting_service_1.createReportSchema))),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)("reports:read"),
    __param(0, (0, common_1.Query)("organizationId")),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getReports", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, permissions_decorator_1.RequirePermissions)("reports:read"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getReport", null);
__decorate([
    (0, common_1.Get)("scheduled"),
    (0, permissions_decorator_1.RequirePermissions)("reports:read"),
    __param(0, (0, common_1.Query)("organizationId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "getScheduled", null);
__decorate([
    (0, common_1.Post)("scheduled"),
    (0, permissions_decorator_1.RequirePermissions)("reports:write"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "createScheduled", null);
__decorate([
    (0, common_1.Delete)("scheduled/:id"),
    (0, permissions_decorator_1.RequirePermissions)("reports:write"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "deleteScheduled", null);
exports.ReportingController = ReportingController = __decorate([
    (0, swagger_1.ApiTags)("Reporting"),
    (0, common_1.Controller)("reports"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [reporting_service_1.ReportingService])
], ReportingController);
//# sourceMappingURL=reporting.controller.js.map