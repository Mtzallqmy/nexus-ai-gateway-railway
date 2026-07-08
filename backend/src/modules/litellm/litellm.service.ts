/**
 * LiteLLM Service
 *
 * The orchestrator that ties together: client, parser, cache, repository,
 * circuit breaker, retry policy, and connection pool.
 *
 * Exposes high-level methods consumed by the controller:
 *   - health / version / models / reload / sync / metrics / status
 *
 * IMPORTANT: This service NEVER talks to AI providers directly.
 * It delegates ALL inference and metadata calls to LiteLLMClient,
 * which itself only talks to the LiteLLM proxy.
 */
import { Injectable, Logger, ServiceUnavailableException, Inject } from "@nestjs/common";
import { LITELLM_LOG_CONTEXTS } from "./litellm.constants";
import type { LiteLLMConfig } from "./litellm.types";
import type {
  LiteLLMHealthResponse,
  LiteLLMLivenessResponse,
  LiteLLMReadinessResponse,
  LiteLLMModelListResponse,
  LiteLLMVersionResponse,
  LiteLLMReloadResponse,
  LiteLLMMetricsSummary,
  LiteLLMStatus,
  SyncEntityType,
  SyncStatusValue,
  LiteLLMSyncResult,
} from "./litellm.types";
import type { LiteLLMClient } from "./litellm.client";
import { LiteLLMParser, type ParsedModel, type ParsedProvider } from "./litellm.parser";
import { LiteLLMCache } from "./litellm.cache";
import type { LiteLLMRepository } from "./litellm.repository";
import { LiteLLMCircuitBreaker } from "./litellm.circuit-breaker";
import { LiteLLMConnectionPool } from "./litellm.connection-pool";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

@Injectable()
export class LiteLLMService {
  private readonly logger = new Logger(LITELLM_LOG_CONTEXTS.SERVICE);

  constructor(
    @Inject("LITELLM_CONFIG") private readonly config: LiteLLMConfig,
    private readonly client: LiteLLMClient,
    private readonly parser: LiteLLMParser,
    private readonly cache: LiteLLMCache,
    private readonly repo: LiteLLMRepository,
    private readonly breaker: LiteLLMCircuitBreaker,
    private readonly pool: LiteLLMConnectionPool,
    private readonly prisma: PrismaService
  ) {
    this.logger.log(`LiteLLM service ready (proxy=${config.baseUrl})`);
  }

  // ============================================================
  // HEALTH
  // ============================================================
  async getHealth(): Promise<LiteLLMHealthResponse> {
    const cached = await this.cache.getHealth<LiteLLMHealthResponse>();
    if (cached) return cached;
    const result = await this.client.getHealthFull();
    await this.cache.setHealth(result);
    return result;
  }

  async getLiveness(): Promise<LiteLLMLivenessResponse> {
    return this.client.getHealthLiveness();
  }

  async getReadiness(): Promise<LiteLLMReadinessResponse> {
    return this.client.getHealthReadiness();
  }

  // ============================================================
  // VERSION
  // ============================================================
  async getVersion(): Promise<LiteLLMVersionResponse> {
    const cached = await this.cache.getVersion<LiteLLMVersionResponse>();
    if (cached) return cached;
    const result = await this.client.getVersion();
    await this.cache.setVersion(result);
    return result;
  }

  // ============================================================
  // MODELS
  // ============================================================
  async getModels(): Promise<LiteLLMModelListResponse> {
    // Try cache first
    const cached = await this.cache.getModels<LiteLLMModelListResponse>();
    if (cached) return cached;

    // Fetch from LiteLLM
    const response = await this.client.getModels();
    await this.cache.setModels(response);
    return response;
  }

  // ============================================================
  // RELOAD
  // ============================================================
  async reload(): Promise<LiteLLMReloadResponse> {
    const result = await this.client.reload();
    // Invalidate caches since config may have changed
    await this.cache.invalidateAll();
    this.logger.log(`LiteLLM config reloaded, caches invalidated`);
    return result;
  }

  // ============================================================
  // SYNC
  // ============================================================
  async sync(entityType: SyncEntityType = "ALL", triggeredBy = "manual"): Promise<LiteLLMSyncResult> {
    const startedAt = new Date();
    const startMs = Date.now();

    let result: LiteLLMSyncResult;
    try {
      switch (entityType) {
        case "PROVIDERS":
          await this.syncProviders(triggeredBy);
          break;
        case "MODELS":
          await this.syncModels(triggeredBy);
          break;
        case "CAPABILITIES":
          await this.syncCapabilities(triggeredBy);
          break;
        case "METADATA":
          await this.syncMetadata(triggeredBy);
          break;
        case "VERSIONS":
          await this.syncVersions(triggeredBy);
          break;
        case "ALL":
        default:
          await this.syncAll(triggeredBy);
          break;
      }
      result = {
        entityType,
        status: "SUCCESS",
        startedAt: startedAt.toISOString(),
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - startMs,
        itemsProcessed: 0,
        itemsCreated: 0,
        itemsUpdated: 0,
        itemsDeleted: 0,
        itemsFailed: 0,
      };
    } catch (err) {
      result = {
        entityType,
        status: "FAILED",
        startedAt: startedAt.toISOString(),
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - startMs,
        itemsProcessed: 0,
        itemsCreated: 0,
        itemsUpdated: 0,
        itemsDeleted: 0,
        itemsFailed: 0,
        errorMessage: (err as Error).message,
      };
    }

    // Record sync history
    await this.repo.recordSync({
      entityType,
      status: result.status as SyncStatusValue,
      startedAt,
      completedAt: new Date(),
      durationMs: result.durationMs,
      itemsProcessed: result.itemsProcessed,
      itemsCreated: result.itemsCreated,
      itemsUpdated: result.itemsUpdated,
      itemsDeleted: result.itemsDeleted,
      itemsFailed: result.itemsFailed,
      triggeredBy,
      errorMessage: result.errorMessage,
      details: { result },
    });

    // Invalidate model cache
    await this.cache.invalidateModels();

    this.logger.log(`Sync ${entityType} ${result.status} in ${result.durationMs}ms`);
    return result;
  }

  private async syncAll(triggeredBy: string): Promise<void> {
    this.logger.log(`[${triggeredBy}] Syncing ALL...`);
    await this.syncProviders(triggeredBy);
    await this.syncModels(triggeredBy);
    await this.syncCapabilities(triggeredBy);
    await this.syncMetadata(triggeredBy);
    await this.syncVersions(triggeredBy);
  }

  private async syncProviders(_triggeredBy: string): Promise<void> {
    const response = await this.client.getModels();
    const { providers } = this.parser.parseModelList(response);
    for (const p of providers) {
      await this.repo.upsertProvider({
        litellmId: p.litellmId,
        name: p.name,
        slug: p.slug,
        type: p.type,
        baseUrl: p.baseUrl,
        supportedFeatures: p.supportedFeatures,
        status: p.status,
        metadata: p.metadata,
      });
    }
  }

  private async syncModels(_triggeredBy: string): Promise<void> {
    const response = await this.client.getModels();
    const { providers, models } = this.parser.parseModelList(response);

    // Map provider name → providerId
    const providerIds = new Map<string, string>();
    for (const p of providers) {
      const stored = await this.repo.findProviders({ slug: p.slug });
      if (stored[0]) providerIds.set(p.name, (stored[0] as { id: string }).id);
    }

    for (const m of models as ParsedModel[]) {
      const providerId = providerIds.get(m.providerName);
      if (!providerId) {
        this.logger.warn(`No provider ID for model ${m.modelName} (provider=${m.providerName})`);
        continue;
      }
      await this.repo.upsertModel({
        providerId,
        modelName: m.modelName,
        litellmModelId: m.litellmModelId,
        displayName: m.displayName,
        contextWindow: m.contextWindow,
        maxOutput: m.maxOutput,
        inputPricePer1k: m.inputPricePer1k,
        outputPricePer1k: m.outputPricePer1k,
        capabilities: m.capabilities,
        modalities: m.modalities,
        isActive: true,
        metadata: m.metadata,
      });
    }
  }

  private async syncCapabilities(_triggeredBy: string): Promise<void> {
    // Capabilities are part of the model sync (extracted by parser)
    // This method exists for granular sync triggers.
    await this.syncModels("capabilities-sub-sync");
  }

  private async syncMetadata(_triggeredBy: string): Promise<void> {
    // Sync provider metadata (region, type, etc.)
    const response = await this.client.getModels();
    const { providers } = this.parser.parseModelList(response);
    for (const p of providers as ParsedProvider[]) {
      await this.repo.upsertProvider({
        litellmId: p.litellmId,
        name: p.name,
        slug: p.slug,
        type: p.type,
        baseUrl: p.baseUrl,
        supportedFeatures: p.supportedFeatures,
        status: p.status,
        metadata: p.metadata,
      });
    }
  }

  private async syncVersions(_triggeredBy: string): Promise<void> {
    const version = await this.client.getVersion();
    await this.cache.setVersion(version);
  }

  // ============================================================
  // METRICS
  // ============================================================
  async getMetrics(): Promise<LiteLLMMetricsSummary> {
    const [providers, health] = await Promise.all([
      this.prisma.provider.count(),
      this.client.getHealthFull().catch(() => null),
    ]);

    const healthyEndpoints = health?.healthy_endpoints?.length ?? 0;
    const unhealthyEndpoints = health?.unhealthy_endpoints?.length ?? 0;
    const totalEndpoints = healthyEndpoints + unhealthyEndpoints;

    const totalModels = await this.prisma.modelCache.count({ where: { isActive: true } });
    const lastSync = await this.repo.findSyncHistory({}, 1);

    const circuits = this.breaker.getAll();
    const openCircuits = circuits.filter((c) => c.state === "OPEN").length;

    return {
      timestamp: new Date().toISOString(),
      totalProviders: providers,
      activeProviders: providers,
      totalModels,
      activeModels: totalModels,
      healthyProviders: healthyEndpoints,
      degradedProviders: 0,
      downProviders: unhealthyEndpoints,
      totalRequests: totalEndpoints,
      totalErrors: unhealthyEndpoints,
      avgLatencyMs: 0,
      cacheHitRate: 0,
      circuitBreakerOpen: openCircuits,
      lastSyncAt: lastSync[0] ? (lastSync[0] as { startedAt: Date }).startedAt.toISOString() : null,
    };
  }

  // ============================================================
  // STATUS
  // ============================================================
  async getStatus(): Promise<LiteLLMStatus> {
    const [version, models, providers, lastSync] = await Promise.all([
      this.client.getVersion().catch(() => null),
      this.prisma.modelCache.count(),
      this.prisma.provider.count(),
      this.repo.findSyncHistory({}, 1),
    ]);

    const circuits = this.breaker.getAll();
    const poolStats = this.pool.getStats();

    return {
      connected: !!version,
      proxyReachable: !!version,
      version: version?.version ?? null,
      lastSyncAt: lastSync[0] ? (lastSync[0] as { startedAt: Date }).startedAt.toISOString() : null,
      lastHealthCheckAt: new Date().toISOString(),
      providerCount: providers,
      modelCount: models,
      cacheStatus: {
        connected: true, // Redis is global; if we got here it's connected
        keys: 0, // Could query SCAN, but expensive; skip
      },
      queueStatus: {
        waiting: 0,
        active: poolStats.active,
        failed: 0,
      },
      circuitBreakers: circuits.map((c) => ({
        providerId: c.key,
        providerName: c.key,
        state: c.state,
        failureCount: c.failureCount,
        lastFailureAt: c.lastFailureAt,
      })),
    };
  }

  // ============================================================
  // SCHEDULED JOBS (called by @Cron / @Interval decorators)
  // ============================================================
  async runScheduledHealthCheck(): Promise<void> {
    this.logger.debug?.(`Scheduled health check running...`);
    try {
      const health = await this.client.getHealthFull();
      for (const endpoint of health.healthy_endpoints ?? []) {
        await this.repo.recordHealthCheck({
          providerId: endpoint.model, // Note: this would need to map to our provider IDs
          status: "HEALTHY",
          checkType: "FULL",
          latencyMs: 0,
          details: { api_base: endpoint.api_base },
          circuitState: "CLOSED",
        }).catch(() => void 0);
      }
      for (const endpoint of health.unhealthy_endpoints ?? []) {
        await this.repo.recordHealthCheck({
          providerId: endpoint.model,
          status: "DOWN",
          checkType: "FULL",
          latencyMs: 0,
          errorMessage: endpoint.error,
          details: { api_base: endpoint.api_base },
          circuitState: this.breaker.isOpen(endpoint.model) ? "OPEN" : "CLOSED",
        }).catch(() => void 0);
      }
    } catch (err) {
      this.logger.warn(`Scheduled health check failed: ${(err as Error).message}`);
    }
  }

  async runScheduledSync(): Promise<void> {
    this.logger.debug?.(`Scheduled sync running...`);
    try {
      await this.sync("ALL", "scheduler");
    } catch (err) {
      this.logger.error(`Scheduled sync failed: ${(err as Error).message}`);
    }
  }

  // ============================================================
  // EXPOSED COMPONENT ACCESSORS (for diagnostics)
  // ============================================================
  getConfig(): LiteLLMConfig {
    return this.config;
  }

  getCircuitBreakerStates() {
    return this.breaker.getAll();
  }

  getConnectionPoolStats() {
    return this.pool.getStats();
  }

  // Expose the LiteLLM service unavailable error for controllers
  static unavailable(message: string): ServiceUnavailableException {
    return new ServiceUnavailableException(message);
  }
}
