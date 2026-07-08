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
exports.SecurityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const security_service_1 = require("./security.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let SecurityController = class SecurityController {
    security;
    constructor(security) {
        this.security = security;
    }
    async getSecrets(category) {
        return this.security.getSecrets(category);
    }
    async storeSecret(body, user) {
        await this.security.storeSecret(body.key, body.value, body.description, body.category, user.id);
        return { message: "Secret stored" };
    }
    async getSecret(key) {
        return { key, value: await this.security.getSecret(key) };
    }
    async rotateSecret(key, value) {
        await this.security.rotateSecret(key, value);
        return { message: "Secret rotated" };
    }
    async deleteSecret(key) {
        await this.security.deleteSecret(key);
        return { message: "Secret deleted" };
    }
    async auditTrail(actorId, action, resource, startDate, endDate, limit) {
        return this.security.getAuditTrail({
            actorId,
            action,
            resource,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            limit: limit ? parseInt(limit) : 100,
        });
    }
    async checkAccess(body) {
        return this.security.checkAccess(body.userId, body.resource, body.action);
    }
};
exports.SecurityController = SecurityController;
__decorate([
    (0, common_1.Get)("secrets"),
    (0, swagger_1.ApiOperation)({ summary: "List encrypted secrets (metadata only, no values)" }),
    __param(0, (0, common_1.Query)("category")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "getSecrets", null);
__decorate([
    (0, common_1.Post)("secrets"),
    (0, swagger_1.ApiOperation)({ summary: "Store an encrypted secret" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "storeSecret", null);
__decorate([
    (0, common_1.Get)("secrets/:key"),
    (0, swagger_1.ApiOperation)({ summary: "Get and decrypt a secret (owner only)" }),
    __param(0, (0, common_1.Param)("key")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "getSecret", null);
__decorate([
    (0, common_1.Post)("secrets/:key/rotate"),
    (0, swagger_1.ApiOperation)({ summary: "Rotate a secret" }),
    __param(0, (0, common_1.Param)("key")),
    __param(1, (0, common_1.Body)("value")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "rotateSecret", null);
__decorate([
    (0, common_1.Delete)("secrets/:key"),
    (0, swagger_1.ApiOperation)({ summary: "Delete a secret" }),
    __param(0, (0, common_1.Param)("key")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "deleteSecret", null);
__decorate([
    (0, common_1.Get)("audit-trail"),
    (0, swagger_1.ApiOperation)({ summary: "Get audit trail (filterable)" }),
    __param(0, (0, common_1.Query)("actorId")),
    __param(1, (0, common_1.Query)("action")),
    __param(2, (0, common_1.Query)("resource")),
    __param(3, (0, common_1.Query)("startDate")),
    __param(4, (0, common_1.Query)("endDate")),
    __param(5, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "auditTrail", null);
__decorate([
    (0, common_1.Post)("check-access"),
    (0, swagger_1.ApiOperation)({ summary: "Check if user has access to a resource/action" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "checkAccess", null);
exports.SecurityController = SecurityController = __decorate([
    (0, swagger_1.ApiTags)("Security"),
    (0, common_1.Controller)("security"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.RequireRoles)("owner"),
    __metadata("design:paramtypes", [security_service_1.SecurityService])
], SecurityController);
//# sourceMappingURL=security.controller.js.map