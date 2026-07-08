import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CostTrackingService } from "./cost-tracking.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Cost Tracking")
@Controller("costs")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CostTrackingController {
  constructor(private readonly costs: CostTrackingService) {}

  @Get("by-provider")
  @RequirePermissions("costs:read")
  @ApiOperation({ summary: "Cost by provider (estimated vs real)" })
  async byProvider(@Query("startDate") startDate?: string, @Query("endDate") endDate?: string) {
    return this.costs.getCostByProvider(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
  }

  @Get("by-user")
  @RequirePermissions("costs:read")
  async byUser(@Query("organizationId") orgId?: string, @Query("startDate") startDate?: string, @Query("endDate") endDate?: string) {
    return this.costs.getCostByUser(orgId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
  }

  @Get("by-organization")
  @RequirePermissions("costs:read")
  async byOrganization(@Query("startDate") startDate?: string, @Query("endDate") endDate?: string) {
    return this.costs.getCostByOrganization(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
  }

  @Get("by-model")
  @RequirePermissions("costs:read")
  async byModel(@Query("startDate") startDate?: string, @Query("endDate") endDate?: string) {
    return this.costs.getCostByModel(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
  }

  @Get("daily")
  @RequirePermissions("costs:read")
  async daily(@Query("organizationId") orgId?: string, @Query("days") days?: string) {
    return this.costs.getDailyCost(orgId, days ? parseInt(days) : 30);
  }

  @Get("monthly")
  @RequirePermissions("costs:read")
  async monthly(@Query("organizationId") orgId?: string, @Query("months") months?: string) {
    return this.costs.getMonthlyCost(orgId, months ? parseInt(months) : 12);
  }

  @Get("total")
  @RequirePermissions("costs:read")
  async total(@Query("organizationId") orgId?: string) {
    return this.costs.getTotalCost(orgId);
  }
}
