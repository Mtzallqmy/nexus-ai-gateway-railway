import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ReportingService, createReportSchema, type CreateReportDto } from "./reporting.service";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Reporting")
@Controller("reports")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportingController {
  constructor(private readonly reporting: ReportingService) {}

  @Post("generate")
  @RequirePermissions("reports:write")
  @ApiOperation({ summary: "Generate a report (CSV, Excel, PDF, JSON)" })
  async generate(@Body(new ZodValidationPipe(createReportSchema)) dto: CreateReportDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reporting.createReport(dto, user.id);
  }

  @Get()
  @RequirePermissions("reports:read")
  async getReports(@Query("organizationId") orgId?: string, @Query("limit") limit?: string) {
    return this.reporting.getReports(orgId, limit ? parseInt(limit) : 50);
  }

  @Get(":id")
  @RequirePermissions("reports:read")
  async getReport(@Param("id") id: string) {
    return this.reporting.getReport(id);
  }

  @Get("scheduled")
  @RequirePermissions("reports:read")
  async getScheduled(@Query("organizationId") orgId?: string) {
    return this.reporting.getScheduledReports(orgId);
  }

  @Post("scheduled")
  @RequirePermissions("reports:write")
  async createScheduled(@Body() body: { name: string; type: "DAILY" | "WEEKLY" | "MONTHLY"; format: "CSV" | "EXCEL" | "PDF" | "JSON"; organizationId?: string; recipientEmails: string[]; cronExpression: string; filters?: Record<string, unknown> }) {
    return this.reporting.createScheduledReport(body);
  }

  @Delete("scheduled/:id")
  @RequirePermissions("reports:write")
  async deleteScheduled(@Param("id") id: string) {
    return this.reporting.deleteScheduledReport(id);
  }
}
