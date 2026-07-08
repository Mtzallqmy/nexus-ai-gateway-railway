import { Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { JobsService } from "./jobs.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { RequireRoles } from "../../common/decorators/roles.decorator";

@ApiTags("Jobs")
@Controller("jobs")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireRoles("owner", "admin")
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Post("execute/:type")
  @ApiOperation({ summary: "Execute a background job manually (cleanup, statistics, aggregation, etc.)" })
  async execute(@Param("type") type: string) {
    return this.jobs.executeJob(type.toUpperCase(), "manual");
  }

  @Get("history")
  @ApiOperation({ summary: "Get job execution history" })
  async history(@Query("type") type?: string, @Query("limit") limit?: string) {
    return this.jobs.getJobHistory(type, limit ? parseInt(limit) : 50);
  }
}
