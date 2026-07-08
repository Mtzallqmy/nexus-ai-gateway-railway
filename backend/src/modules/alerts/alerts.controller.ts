import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AlertsService, createAlertRuleSchema, type CreateAlertRuleDto } from "./alerts.service";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Alerts")
@Controller("alerts")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AlertsController {
  constructor(private readonly alerts: AlertsService) {}

  @Get()
  @RequirePermissions("alerts:read")
  @ApiOperation({ summary: "List alerts (filterable by status, severity)" })
  async getAlerts(@Query("status") status?: string, @Query("severity") severity?: string, @Query("limit") limit?: string) {
    return this.alerts.getAlerts(status, severity, limit ? parseInt(limit) : 50);
  }

  @Get("rules")
  @RequirePermissions("alerts:read")
  @ApiOperation({ summary: "List alert rules" })
  async getRules(@Query("includeDisabled") includeDisabled?: string) {
    return this.alerts.getRules(includeDisabled === "true");
  }

  @Post("rules")
  @RequirePermissions("alerts:write")
  @ApiOperation({ summary: "Create an alert rule" })
  async createRule(@Body(new ZodValidationPipe(createAlertRuleSchema)) dto: CreateAlertRuleDto) {
    return this.alerts.createRule(dto);
  }

  @Patch("rules/:id")
  @RequirePermissions("alerts:write")
  async updateRule(@Param("id") id: string, @Body() dto: Partial<CreateAlertRuleDto>) {
    return this.alerts.updateRule(id, dto);
  }

  @Delete("rules/:id")
  @RequirePermissions("alerts:write")
  async deleteRule(@Param("id") id: string) {
    return this.alerts.deleteRule(id);
  }

  @Post(":id/acknowledge")
  @RequirePermissions("alerts:write")
  async acknowledge(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    await this.alerts.acknowledgeAlert(id, user.id);
    return { message: "Alert acknowledged" };
  }

  @Post(":id/resolve")
  @RequirePermissions("alerts:write")
  async resolve(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser, @Body("reason") reason?: string) {
    await this.alerts.resolveAlert(id, user.id, reason);
    return { message: "Alert resolved" };
  }

  @Post("evaluate")
  @RequirePermissions("alerts:write")
  @ApiOperation({ summary: "Manually trigger alert evaluation" })
  async evaluate() {
    return this.alerts.evaluateAlerts();
  }
}
