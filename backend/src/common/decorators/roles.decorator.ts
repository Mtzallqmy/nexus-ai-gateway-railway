import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "requiredRoles";

/**
 * Require specific role slugs on a route.
 * The PermissionsGuard will check that the user has at least one of them.
 *
 * @example
 *   @RequireRoles('owner', 'admin')
 */
export const RequireRoles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
