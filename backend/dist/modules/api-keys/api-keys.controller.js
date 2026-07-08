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
exports.ApiKeysController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_keys_service_1 = require("./api-keys.service");
const api_key_dto_1 = require("./dto/api-key.dto");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ApiKeysController = class ApiKeysController {
    keys;
    constructor(keys) {
        this.keys = keys;
    }
    async findAll(query) {
        return this.keys.findAll(query);
    }
    async findOne(id) {
        return this.keys.findOne(id);
    }
    async create(dto, user) {
        return this.keys.create(dto, user.id);
    }
    async rotate(id, user) {
        return this.keys.rotate(id, user.id);
    }
    async revoke(id, reason) {
        return this.keys.revoke(id, reason);
    }
    async remove(id) {
        return this.keys.remove(id);
    }
};
exports.ApiKeysController = ApiKeysController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)("api-keys:read"),
    (0, swagger_1.ApiOperation)({ summary: "List API keys (paginated, filterable, searchable)" }),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(api_key_dto_1.listApiKeysQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiKeysController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, permissions_decorator_1.RequirePermissions)("api-keys:read"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiKeysController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)("api-keys:write"),
    (0, swagger_1.ApiOperation)({ summary: "Create a new API key (raw key only returned once)" }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(api_key_dto_1.createApiKeySchema))),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ApiKeysController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(":id/rotate"),
    (0, permissions_decorator_1.RequirePermissions)("api-keys:write"),
    (0, swagger_1.ApiOperation)({ summary: "Rotate an API key (revokes old, returns new)" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ApiKeysController.prototype, "rotate", null);
__decorate([
    (0, common_1.Post)(":id/revoke"),
    (0, permissions_decorator_1.RequirePermissions)("api-keys:write"),
    (0, swagger_1.ApiOperation)({ summary: "Revoke an API key" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("reason")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ApiKeysController.prototype, "revoke", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, permissions_decorator_1.RequirePermissions)("api-keys:delete"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiKeysController.prototype, "remove", null);
exports.ApiKeysController = ApiKeysController = __decorate([
    (0, swagger_1.ApiTags)("API Keys"),
    (0, common_1.Controller)("api-keys"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [api_keys_service_1.ApiKeysService])
], ApiKeysController);
//# sourceMappingURL=api-keys.controller.js.map