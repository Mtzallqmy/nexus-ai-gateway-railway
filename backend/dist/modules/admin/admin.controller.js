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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AdminController = class AdminController {
    admin;
    constructor(admin) {
        this.admin = admin;
    }
    async getSettings(category, publicOnly) {
        return this.admin.getSettings(category, publicOnly === "true");
    }
    async getSetting(key) {
        return this.admin.getSetting(key);
    }
    async setSetting(body, user) {
        await this.admin.setSetting(body.key, body.value, user.id);
        return { message: "Setting updated" };
    }
    async deleteSetting(key) {
        await this.admin.deleteSetting(key);
        return { message: "Setting deleted" };
    }
    async overview() {
        return this.admin.getSystemOverview();
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)("settings"),
    (0, swagger_1.ApiOperation)({ summary: "List admin settings (filterable by category)" }),
    __param(0, (0, common_1.Query)("category")),
    __param(1, (0, common_1.Query)("publicOnly")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Get)("settings/:key"),
    (0, swagger_1.ApiOperation)({ summary: "Get a single admin setting" }),
    __param(0, (0, common_1.Param)("key")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSetting", null);
__decorate([
    (0, common_1.Post)("settings"),
    (0, swagger_1.ApiOperation)({ summary: "Set an admin setting (upsert)" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "setSetting", null);
__decorate([
    (0, common_1.Delete)("settings/:key"),
    (0, swagger_1.ApiOperation)({ summary: "Delete an admin setting (blocks read-only settings)" }),
    __param(0, (0, common_1.Param)("key")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteSetting", null);
__decorate([
    (0, common_1.Get)("overview"),
    (0, swagger_1.ApiOperation)({ summary: "System overview — counts of users, orgs, subscriptions, alerts, reports" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "overview", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)("Admin"),
    (0, common_1.Controller)("admin"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.RequireRoles)("owner", "admin"),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map