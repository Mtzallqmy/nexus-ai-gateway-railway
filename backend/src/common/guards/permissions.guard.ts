import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { ROLES_KEY } from "../decorators/roles.decorator";
import type { AuthenticatedUser } from "../decorators/current-user.decorator";

/**
 * Checks that the authenticated user has the required permissions or roles.
 * Use @RequirePermissions() and/or @RequireRoles() on routes.
 *
 * Permission logic:
 *   - If user.permissions contains "*" → allow
 *   - Else if user.permissions contains any required permission → allow
 *   - Else deny
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions?.length && !requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new ForbiddenException("Authentication required");
    }

    const userPerms = user.permissions ?? [];
    const userRole = user.role ?? "";

    // Wildcard permission
    if (userPerms.includes("*")) return true;

    // Check roles
    if (requiredRoles?.length && !requiredRoles.includes(userRole)) {
      this.logger.warn(
        `User ${user.email} denied: role '${userRole}' not in [${requiredRoles.join(", ")}]`
      );
      throw new ForbiddenException("Insufficient role");
    }

    // Check permissions
    if (requiredPermissions?.length) {
      const hasAny = requiredPermissions.some((p) => userPerms.includes(p));
      if (!hasAny) {
        this.logger.warn(
          `User ${user.email} denied: missing one of [${requiredPermissions.join(", ")}]`
        );
        throw new ForbiddenException("Insufficient permissions");
      }
    }

    return true;
  }
}
