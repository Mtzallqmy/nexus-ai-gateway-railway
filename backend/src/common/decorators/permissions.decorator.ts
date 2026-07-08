import { SetMetadata } from "@nestjs/common";

export const PERMISSIONS_KEY = "requiredPermissions";

/**
 * Require specific permission slugs on a route.
 * The PermissionsGuard will check that the user has at least one of them.
 *
 * @example
 *   @RequirePermissions('users:read', 'users:write')
 *   @UseGuards(JwtAuthGuard, PermissionsGuard)
 *   @Get('users')
 *   list() { ... }
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
