import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { SecurityService } from "./security.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { RequireRoles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Security")
@Controller("security")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireRoles("owner")
export class SecurityController {
  constructor(private readonly security: SecurityService) {}

  // ENCRYPTED SECRETS
  @Get("secrets")
  @ApiOperation({ summary: "List encrypted secrets (metadata only, no values)" })
  async getSecrets(@Query("category") category?: string) {
    return this.security.getSecrets(category);
  }

  @Post("secrets")
  @ApiOperation({ summary: "Store an encrypted secret" })
  async storeSecret(@Body() body: { key: string; value: string; description?: string; category?: string }, @CurrentUser() user: AuthenticatedUser) {
    await this.security.storeSecret(body.key, body.value, body.description, body.category, user.id);
    return { message: "Secret stored" };
  }

  @Get("secrets/:key")
  @ApiOperation({ summary: "Get and decrypt a secret (owner only)" })
  async getSecret(@Param("key") key: string) {
    return { key, value: await this.security.getSecret(key) };
  }

  @Post("secrets/:key/rotate")
  @ApiOperation({ summary: "Rotate a secret" })
  async rotateSecret(@Param("key") key: string, @Body("value") value: string) {
    await this.security.rotateSecret(key, value);
    return { message: "Secret rotated" };
  }

  @Delete("secrets/:key")
  @ApiOperation({ summary: "Delete a secret" })
  async deleteSecret(@Param("key") key: string) {
    await this.security.deleteSecret(key);
    return { message: "Secret deleted" };
  }

  // AUDIT TRAIL
  @Get("audit-trail")
  @ApiOperation({ summary: "Get audit trail (filterable)" })
  async auditTrail(
    @Query("actorId") actorId?: string,
    @Query("action") action?: string,
    @Query("resource") resource?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("limit") limit?: string
  ) {
    return this.security.getAuditTrail({
      actorId,
      action,
      resource,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : 100,
    });
  }

  // ACCESS CONTROL
  @Post("check-access")
  @ApiOperation({ summary: "Check if user has access to a resource/action" })
  async checkAccess(@Body() body: { userId: string; resource: string; action: string }) {
    return this.security.checkAccess(body.userId, body.resource, body.action);
  }
}
