/**
 * LiteLLM Controller
 *
 * Exposes 7 endpoints for managing the LiteLLM proxy integration.
 * All endpoints require JWT auth + the `litellm:read` permission
 * (write ops require `litellm:write`).
 *
 * Endpoints:
 *   GET    /litellm/health    — current health of all LiteLLM endpoints
 *   GET    /litellm/version   — LiteLLM proxy version
 *   GET    /litellm/models    — list of models configured in LiteLLM
 *   POST   /litellm/reload    — reload LiteLLM config (after editing proxy_config.yaml)
 *   POST   /litellm/sync      — trigger synchronization of providers/models from LiteLLM
 *   GET    /litellm/metrics   — aggregated metrics summary
 *   GET    /litellm/status    — overall LiteLLM integration status
 *
 * Internal endpoint (called BY LiteLLM via callback):
 *   POST   /litellm/internal/callback — receives success/failure callbacks from LiteLLM
 */
import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { LiteLLMService } from "./litellm.service";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import {
  syncSchema,
  listModelsQuerySchema,
  type SyncDto,
  type ListModelsQueryDto,
} from "./dto/litellm.dto";
import { Public } from "../../common/decorators/public.decorator";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";

@ApiTags("LiteLLM")
@Controller("litellm")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LiteLLMController {
  constructor(private readonly litellm: LiteLLMService) {}

  // ============================================================
  // HEALTH
  // ============================================================
  @Get("health")
  @RequirePermissions("litellm:read")
  @ApiOperation({ summary: "Get LiteLLM proxy health (all endpoints healthy/unhealthy)" })
  async health() {
    return this.litellm.getHealth();
  }

  @Get("health/liveness")
  @RequirePermissions("litellm:read")
  @ApiOperation({ summary: "LiteLLM liveness probe" })
  async liveness() {
    return this.litellm.getLiveness();
  }

  @Get("health/readiness")
  @RequirePermissions("litellm:read")
  @ApiOperation({ summary: "LiteLLM readiness probe" })
  async readiness() {
    return this.litellm.getReadiness();
  }

  // ============================================================
  // VERSION
  // ============================================================
  @Get("version")
  @RequirePermissions("litellm:read")
  @ApiOperation({ summary: "Get LiteLLM proxy version" })
  async version() {
    return this.litellm.getVersion();
  }

  // ============================================================
  // MODELS
  // ============================================================
  @Get("models")
  @RequirePermissions("litellm:read")
  @ApiOperation({ summary: "List all models configured in LiteLLM (with caching)" })
  async models(@Query(new ZodValidationPipe(listModelsQuerySchema)) _query: ListModelsQueryDto) {
    return this.litellm.getModels();
  }

  // ============================================================
  // RELOAD
  // ============================================================
  @Post("reload")
  @RequirePermissions("litellm:write")
  @ApiOperation({ summary: "Trigger LiteLLM config reload + invalidate caches" })
  async reload() {
    return this.litellm.reload();
  }

  // ============================================================
  // SYNC
  // ============================================================
  @Post("sync")
  @RequirePermissions("litellm:write")
  @ApiOperation({ summary: "Synchronize providers/models/capabilities from LiteLLM" })
  async sync(@Body(new ZodValidationPipe(syncSchema)) dto: SyncDto) {
    return this.litellm.sync(dto.entityType, "manual");
  }

  // ============================================================
  // METRICS
  // ============================================================
  @Get("metrics")
  @RequirePermissions("litellm:read")
  @ApiOperation({ summary: "Aggregated LiteLLM metrics (provider counts, model counts, health, circuit breakers)" })
  async metrics() {
    return this.litellm.getMetrics();
  }

  // ============================================================
  // STATUS
  // ============================================================
  @Get("status")
  @RequirePermissions("litellm:read")
  @ApiOperation({ summary: "Overall LiteLLM integration status (connectivity, version, last sync, circuit breakers)" })
  async status() {
    return this.litellm.getStatus();
  }

  // ============================================================
  // CONFIG (diagnostic)
  // ============================================================
  @Get("config")
  @RequirePermissions("litellm:read")
  @ApiOperation({ summary: "View the LiteLLM client configuration (no secrets)" })
  async config() {
    const c = this.litellm.getConfig();
    return {
      baseUrl: c.baseUrl,
      requestTimeoutMs: c.requestTimeoutMs,
      streamTimeoutMs: c.streamTimeoutMs,
      syncIntervalMinutes: c.syncIntervalMinutes,
      healthCheckIntervalMs: c.healthCheckIntervalMs,
      cacheTtlSeconds: c.cacheTtlSeconds,
      circuitBreakerFailureThreshold: c.circuitBreakerFailureThreshold,
      circuitBreakerResetTimeoutMs: c.circuitBreakerResetTimeoutMs,
      retryAttempts: c.retryAttempts,
      retryBaseDelayMs: c.retryBaseDelayMs,
      poolMaxConnections: c.poolMaxConnections,
    };
  }

  // ============================================================
  // INTERNAL CALLBACK (called BY LiteLLM, not by clients)
  // ============================================================
  @Public()
  @Post("internal/callback")
  @ApiOperation({ summary: "Internal: callback endpoint for LiteLLM success/failure events" })
  async callback(@Body() body: unknown) {
    // Queue the callback for async processing to avoid blocking
    // QueueService.addJob("litellm-callback", "process-callback", body) in production
    return { received: true, body };
  }
}
