import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AnalyticsService, type AnalyticsQuery } from "./analytics.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { z } from "zod";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";

const analyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  providerName: z.string().optional(),
  modelName: z.string().optional(),
  organizationId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  granularity: z.enum(["hour", "day", "week", "month"]).default("day"),
});

@ApiTags("Analytics")
@Controller("analytics")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get("usage")
  @RequirePermissions("analytics:read")
  @ApiOperation({ summary: "Usage analytics — requests, tokens, streaming, images, embeddings, etc." })
  async usage(@Query(new ZodValidationPipe(analyticsQuerySchema)) query: AnalyticsQuery) {
    return this.analytics.getUsageAnalytics(query);
  }

  @Get("requests")
  @RequirePermissions("analytics:read")
  @ApiOperation({ summary: "Request analytics — by provider, model, endpoint, method" })
  async requests(@Query(new ZodValidationPipe(analyticsQuerySchema)) query: AnalyticsQuery) {
    return this.analytics.getRequestAnalytics(query);
  }

  @Get("providers")
  @RequirePermissions("analytics:read")
  @ApiOperation({ summary: "Provider analytics — per-provider requests, tokens, cost, errors, latency" })
  async providers(@Query(new ZodValidationPipe(analyticsQuerySchema)) query: AnalyticsQuery) {
    return this.analytics.getProviderAnalytics(query);
  }

  @Get("models")
  @RequirePermissions("analytics:read")
  @ApiOperation({ summary: "Model analytics — per-model requests, tokens, cost, latency" })
  async models(@Query(new ZodValidationPipe(analyticsQuerySchema)) query: AnalyticsQuery) {
    return this.analytics.getModelAnalytics(query);
  }

  @Get("cost")
  @RequirePermissions("analytics:read")
  @ApiOperation({ summary: "Cost analytics — estimated vs real, by provider, by model" })
  async cost(@Query(new ZodValidationPipe(analyticsQuerySchema)) query: AnalyticsQuery) {
    return this.analytics.getCostAnalytics(query);
  }

  @Get("latency")
  @RequirePermissions("analytics:read")
  @ApiOperation({ summary: "Latency analytics — avg, p50, p95, p99, by provider" })
  async latency(@Query(new ZodValidationPipe(analyticsQuerySchema)) query: AnalyticsQuery) {
    return this.analytics.getLatencyAnalytics(query);
  }

  @Get("errors")
  @RequirePermissions("analytics:read")
  @ApiOperation({ summary: "Error analytics — error rate, success rate, failure rate" })
  async errors(@Query(new ZodValidationPipe(analyticsQuerySchema)) query: AnalyticsQuery) {
    return this.analytics.getErrorAnalytics(query);
  }

  @Get("users")
  @RequirePermissions("analytics:read")
  @ApiOperation({ summary: "User analytics — per-user requests, tokens, cost" })
  async users(@Query(new ZodValidationPipe(analyticsQuerySchema)) query: AnalyticsQuery) {
    return this.analytics.getUserAnalytics(query);
  }

  @Get("organizations")
  @RequirePermissions("analytics:read")
  @ApiOperation({ summary: "Organization analytics — per-org requests, tokens, cost" })
  async organizations(@Query(new ZodValidationPipe(analyticsQuerySchema)) query: AnalyticsQuery) {
    return this.analytics.getOrganizationAnalytics(query);
  }

  @Get("api-keys")
  @RequirePermissions("analytics:read")
  @ApiOperation({ summary: "API key analytics — per-key requests, tokens, cost" })
  async apiKeys(@Query(new ZodValidationPipe(analyticsQuerySchema)) query: AnalyticsQuery) {
    return this.analytics.getApiAnalytics(query);
  }

  @Get("executive-dashboard")
  @RequirePermissions("analytics:read")
  @ApiOperation({ summary: "Executive dashboard — 24h/7d/30d summary, top providers/models, alerts, revenue" })
  async executiveDashboard() {
    return this.analytics.getExecutiveDashboard();
  }
}
