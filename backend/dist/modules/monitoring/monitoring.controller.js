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
exports.MonitoringController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const monitoring_service_1 = require("./monitoring.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
let MonitoringController = class MonitoringController {
    monitoring;
    constructor(monitoring) {
        this.monitoring = monitoring;
    }
    async system() {
        return this.monitoring.getSystemMetrics();
    }
    async services() {
        return this.monitoring.getServiceHealth();
    }
    async dashboard() {
        return this.monitoring.getHealthDashboard();
    }
    async integrations() {
        return this.monitoring.getIntegrationStatus();
    }
    async metrics() {
        return this.monitoring.getRecentMetrics();
    }
    async recordMetric(body) {
        await this.monitoring.recordMetric(body.name, body.value, body.unit, body.labels);
        return { message: "Metric recorded" };
    }
};
exports.MonitoringController = MonitoringController;
__decorate([
    (0, common_1.Get)("system"),
    (0, permissions_decorator_1.RequirePermissions)("monitoring:read"),
    (0, swagger_1.ApiOperation)({ summary: "System metrics — CPU, RAM, Disk, Network, process" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "system", null);
__decorate([
    (0, common_1.Get)("services"),
    (0, permissions_decorator_1.RequirePermissions)("monitoring:read"),
    (0, swagger_1.ApiOperation)({ summary: "Service health — PostgreSQL, Redis, LiteLLM, NestJS, Next.js" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "services", null);
__decorate([
    (0, common_1.Get)("dashboard"),
    (0, permissions_decorator_1.RequirePermissions)("monitoring:read"),
    (0, swagger_1.ApiOperation)({ summary: "Health dashboard — system + services + recent metrics" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)("integrations"),
    (0, permissions_decorator_1.RequirePermissions)("monitoring:read"),
    (0, swagger_1.ApiOperation)({ summary: "External integration status — Grafana, Prometheus, Uptime Kuma" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "integrations", null);
__decorate([
    (0, common_1.Get)("metrics"),
    (0, permissions_decorator_1.RequirePermissions)("monitoring:read"),
    (0, swagger_1.ApiOperation)({ summary: "Recent system metrics from database" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "metrics", null);
__decorate([
    (0, common_1.Post)("metrics"),
    (0, permissions_decorator_1.RequirePermissions)("monitoring:write"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "recordMetric", null);
exports.MonitoringController = MonitoringController = __decorate([
    (0, swagger_1.ApiTags)("Monitoring"),
    (0, common_1.Controller)("monitoring"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [monitoring_service_1.MonitoringService])
], MonitoringController);
//# sourceMappingURL=monitoring.controller.js.map