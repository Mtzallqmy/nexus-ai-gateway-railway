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
exports.PermissionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const permissions_service_1 = require("./permissions.service");
const permission_dto_1 = require("./dto/permission.dto");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
let PermissionsController = class PermissionsController {
    perms;
    constructor(perms) {
        this.perms = perms;
    }
    async findAll(query) {
        return this.perms.findAll(query);
    }
    async grouped() {
        return this.perms.grouped();
    }
    async findOne(id) {
        return this.perms.findOne(id);
    }
    async create(dto) {
        return this.perms.create(dto);
    }
    async grant(body) {
        return this.perms.grantToUser(body.userId, body.permissionId);
    }
    async revoke(body) {
        return this.perms.revokeFromUser(body.userId, body.permissionId);
    }
    async remove(id) {
        return this.perms.remove(id);
    }
};
exports.PermissionsController = PermissionsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)("permissions:read"),
    (0, swagger_1.ApiOperation)({ summary: "List permissions (paginated, filterable, searchable)" }),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(permission_dto_1.listPermissionsQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("grouped"),
    (0, permissions_decorator_1.RequirePermissions)("permissions:read"),
    (0, swagger_1.ApiOperation)({ summary: "List permissions grouped by group field" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "grouped", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, permissions_decorator_1.RequirePermissions)("permissions:read"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)("permissions:write"),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(permission_dto_1.createPermissionSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)("grant"),
    (0, permissions_decorator_1.RequirePermissions)("permissions:write"),
    (0, swagger_1.ApiOperation)({ summary: "Grant a permission directly to a user" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "grant", null);
__decorate([
    (0, common_1.Post)("revoke"),
    (0, permissions_decorator_1.RequirePermissions)("permissions:write"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "revoke", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, permissions_decorator_1.RequirePermissions)("permissions:delete"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "remove", null);
exports.PermissionsController = PermissionsController = __decorate([
    (0, swagger_1.ApiTags)("Permissions"),
    (0, common_1.Controller)("permissions"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [permissions_service_1.PermissionsService])
], PermissionsController);
//# sourceMappingURL=permissions.controller.js.map