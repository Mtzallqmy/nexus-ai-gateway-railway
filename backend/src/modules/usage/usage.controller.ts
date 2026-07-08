import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UsageService } from "./usage.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { z } from "zod";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";

const usageQuerySchema = z.object({
  organizationId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

@ApiTags("Usage")
@Controller("usage")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsageController {
  constructor(private readonly usage: UsageService) {}

  @Get("summary")
  @RequirePermissions("usage:read")
  @ApiOperation({ summary: "Usage summary — requests, tokens, cost, errors" })
  async summary(@Query(new ZodValidationPipe(usageQuerySchema)) query: { organizationId?: string; startDate?: string; endDate?: string }) {
    return this.usage.getUsageSummary(
      query.organizationId,
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined
    );
  }

  @Get("by-type")
  @RequirePermissions("usage:read")
  @ApiOperation({ summary: "Usage by type — streaming, images, embeddings, speech, vision, moderation" })
  async byType(@Query(new ZodValidationPipe(usageQuerySchema)) query: { organizationId?: string; startDate?: string; endDate?: string }) {
    return this.usage.getUsageByType(
      query.organizationId,
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined
    );
  }
}
