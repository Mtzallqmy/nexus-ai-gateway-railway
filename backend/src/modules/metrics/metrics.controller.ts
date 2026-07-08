import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { MetricsService } from "./metrics.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Metrics")
@Controller("metrics")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get()
  @RequirePermissions("metrics:read")
  @ApiOperation({ summary: "Collect system metrics (database, cache, queues, memory)" })
  async collect() {
    return this.metrics.collect();
  }
}
