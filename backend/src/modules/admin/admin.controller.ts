import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AdminService, type AdminCategory } from "./admin.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { RequireRoles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Admin")
@Controller("admin")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireRoles("owner", "admin")
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("settings")
  @ApiOperation({ summary: "List admin settings (filterable by category)" })
  async getSettings(@Query("category") category?: AdminCategory, @Query("publicOnly") publicOnly?: string) {
    return this.admin.getSettings(category, publicOnly === "true");
  }

  @Get("settings/:key")
  @ApiOperation({ summary: "Get a single admin setting" })
  async getSetting(@Param("key") key: string) {
    return this.admin.getSetting(key);
  }

  @Post("settings")
  @ApiOperation({ summary: "Set an admin setting (upsert)" })
  async setSetting(@Body() body: { key: string; value: unknown }, @CurrentUser() user: AuthenticatedUser) {
    await this.admin.setSetting(body.key, body.value, user.id);
    return { message: "Setting updated" };
  }

  @Delete("settings/:key")
  @ApiOperation({ summary: "Delete an admin setting (blocks read-only settings)" })
  async deleteSetting(@Param("key") key: string) {
    await this.admin.deleteSetting(key);
    return { message: "Setting deleted" };
  }

  @Get("overview")
  @ApiOperation({ summary: "System overview — counts of users, orgs, subscriptions, alerts, reports" })
  async overview() {
    return this.admin.getSystemOverview();
  }
}
