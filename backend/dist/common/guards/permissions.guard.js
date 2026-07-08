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
var PermissionsGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const permissions_decorator_1 = require("../decorators/permissions.decorator");
const roles_decorator_1 = require("../decorators/roles.decorator");
let PermissionsGuard = PermissionsGuard_1 = class PermissionsGuard {
    reflector;
    logger = new common_1.Logger(PermissionsGuard_1.name);
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredPermissions = this.reflector.getAllAndOverride(permissions_decorator_1.PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredPermissions?.length && !requiredRoles?.length) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException("Authentication required");
        }
        const userPerms = user.permissions ?? [];
        const userRole = user.role ?? "";
        if (userPerms.includes("*"))
            return true;
        if (requiredRoles?.length && !requiredRoles.includes(userRole)) {
            this.logger.warn(`User ${user.email} denied: role '${userRole}' not in [${requiredRoles.join(", ")}]`);
            throw new common_1.ForbiddenException("Insufficient role");
        }
        if (requiredPermissions?.length) {
            const hasAny = requiredPermissions.some((p) => userPerms.includes(p));
            if (!hasAny) {
                this.logger.warn(`User ${user.email} denied: missing one of [${requiredPermissions.join(", ")}]`);
                throw new common_1.ForbiddenException("Insufficient permissions");
            }
        }
        return true;
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = PermissionsGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], PermissionsGuard);
//# sourceMappingURL=permissions.guard.js.map