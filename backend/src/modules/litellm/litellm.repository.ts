/**
 * LiteLLM Repository
 *
 * Data access layer between the LiteLLM service and Prisma.
 * Persists providers, models, sync history, health checks, metrics,
 * and usage counters.
 */
import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { LITELLM_LOG_CONTEXTS } from "./litellm.constants";
import type { ILiteLLMRepository } from "./litellm.interfaces";

@Injectable()
export class LiteLLMRepository implements ILiteLLMRepository {
  private readonly logger = new Logger(LITELLM_LOG_CONTEXTS.REPOSITORY);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // PROVIDERS
  // ============================================================
  async upsertProvider(data: Record<string, unknown>) {
    const litellmId = data.litellmId as string;
    return this.prisma.provider.upsert({
      where: { litellmId },
      update: {
        name: data.name as string,
        type: data.type as never,
        description: data.description as string | undefined,
        baseUrl: data.baseUrl as string | undefined,
        status: data.status as never,
        supportedFeatures: (data.supportedFeatures as string[]) ?? [],
        region: data.region as string | undefined,
        lastSyncedAt: new Date(),
        metadata: (data.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
      create: {
        litellmId,
        name: data.name as string,
        slug: data.slug as string,
        type: (data.type as never) ?? "CUSTOM",
        description: data.description as string | undefined,
        baseUrl: data.baseUrl as string | undefined,
        status: (data.status as never) ?? "UNKNOWN",
        supportedFeatures: (data.supportedFeatures as string[]) ?? [],
        region: data.region as string | undefined,
        metadata: (data.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });
  }

  async findProviders(filter?: Record<string, unknown>) {
    return this.prisma.provider.findMany({
      where: filter as Prisma.ProviderWhereInput,
      orderBy: { name: "asc" },
    });
  }

  async findProviderById(id: string) {
    return this.prisma.provider.findUnique({ where: { id } });
  }

  // ============================================================
  // MODELS
  // ============================================================
  async upsertModel(data: Record<string, unknown>) {
    const providerId = data.providerId as string;
    const modelName = data.modelName as string;
    return this.prisma.modelCache.upsert({
      where: { providerId_modelName: { providerId, modelName } },
      update: {
        litellmModelId: data.litellmModelId as string,
        displayName: data.displayName as string,
        description: data.description as string | undefined,
        contextWindow: data.contextWindow as number | undefined,
        maxOutput: data.maxOutput as number | undefined,
        inputPricePer1k: data.inputPricePer1k as Prisma.Decimal | undefined,
        outputPricePer1k: data.outputPricePer1k as Prisma.Decimal | undefined,
        capabilities: (data.capabilities as string[]) ?? [],
        modalities: (data.modalities as string[]) ?? [],
        isActive: data.isActive as boolean | undefined,
        metadata: (data.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        lastSyncedAt: new Date(),
      },
      create: {
        providerId,
        modelName,
        litellmModelId: data.litellmModelId as string,
        displayName: data.displayName as string,
        description: data.description as string | undefined,
        contextWindow: data.contextWindow as number | undefined,
        maxOutput: data.maxOutput as number | undefined,
        inputPricePer1k: data.inputPricePer1k as Prisma.Decimal | undefined,
        outputPricePer1k: data.outputPricePer1k as Prisma.Decimal | undefined,
        capabilities: (data.capabilities as string[]) ?? [],
        modalities: (data.modalities as string[]) ?? [],
        isActive: (data.isActive as boolean) ?? true,
        metadata: (data.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        lastSyncedAt: new Date(),
      },
    });
  }

  async findModels(filter?: Record<string, unknown>) {
    return this.prisma.modelCache.findMany({
      where: filter as Prisma.ModelCacheWhereInput,
      include: { provider: { select: { id: true, name: true, slug: true, type: true } } },
      orderBy: { modelName: "asc" },
    });
  }

  async deleteStaleModels(activeIds: string[]): Promise<number> {
    if (activeIds.length === 0) {
      const r = await this.prisma.modelCache.deleteMany({});
      return r.count;
    }
    const r = await this.prisma.modelCache.deleteMany({
      where: { id: { notIn: activeIds } },
    });
    return r.count;
  }

  // ============================================================
  // SYNC HISTORY
  // ============================================================
  async recordSync(data: Record<string, unknown>) {
    return this.prisma.synchronizationHistory.create({
      data: {
        entityType: data.entityType as never,
        status: data.status as never,
        startedAt: data.startedAt as Date,
        completedAt: data.completedAt as Date | undefined,
        durationMs: (data.durationMs as number) ?? 0,
        itemsProcessed: (data.itemsProcessed as number) ?? 0,
        itemsCreated: (data.itemsCreated as number) ?? 0,
        itemsUpdated: (data.itemsUpdated as number) ?? 0,
        itemsDeleted: (data.itemsDeleted as number) ?? 0,
        itemsFailed: (data.itemsFailed as number) ?? 0,
        triggeredBy: (data.triggeredBy as string) ?? "system",
        errorMessage: data.errorMessage as string | undefined,
        details: (data.details as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });
  }

  async findSyncHistory(filter?: Record<string, unknown>, limit = 20) {
    return this.prisma.synchronizationHistory.findMany({
      where: filter as Prisma.SynchronizationHistoryWhereInput,
      orderBy: { startedAt: "desc" },
      take: limit,
    });
  }

  // ============================================================
  // HEALTH
  // ============================================================
  async recordHealthCheck(data: Record<string, unknown>) {
    return this.prisma.providerHealth.create({
      data: {
        providerId: data.providerId as string,
        status: data.status as never,
        checkType: (data.checkType as never) ?? "FULL",
        latencyMs: (data.latencyMs as number) ?? 0,
        errorMessage: data.errorMessage as string | undefined,
        details: (data.details as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        circuitState: (data.circuitState as never) ?? "CLOSED",
      },
    });
  }

  async findLatestHealth(providerId: string) {
    return this.prisma.providerHealth.findFirst({
      where: { providerId },
      orderBy: { checkedAt: "desc" },
    });
  }

  // ============================================================
  // METRICS
  // ============================================================
  async recordMetric(data: Record<string, unknown>) {
    return this.prisma.providerMetric.create({
      data: {
        providerId: data.providerId as string,
        metricName: data.metricName as string,
        metricValue: data.metricValue as number,
        metricUnit: data.metricUnit as string | undefined,
        labels: (data.labels as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });
  }

  async aggregateMetrics(providerId?: string) {
    const where: Prisma.ProviderMetricWhereInput = providerId ? { providerId } : {};
    return this.prisma.providerMetric.groupBy({
      by: ["metricName"],
      where,
      _avg: { metricValue: true },
      _min: { metricValue: true },
      _max: { metricValue: true },
      _count: { metricValue: true },
    });
  }

  // ============================================================
  // USAGE COUNTERS
  // ============================================================
  async incrementUsage(data: Record<string, unknown>): Promise<void> {
    // Upsert a counter row for the current period (1-minute bucket)
    const periodStart = new Date(Math.floor(Date.now() / 60_000) * 60_000);
    const periodEnd = new Date(periodStart.getTime() + 60_000);

    await this.prisma.usageCounter.upsert({
      where: {
        // Prisma needs a unique constraint; this is a synthetic one
        id: data.counterId as string,
      },
      update: {},
      create: {
        id: data.counterId as string,
        providerId: data.providerId as string | undefined,
        modelName: data.modelName as string,
        userId: data.userId as string | undefined,
        apiKeyId: data.apiKeyId as string | undefined,
        organizationId: data.organizationId as string | undefined,
        requestCount: (data.requestCount as number) ?? 0,
        tokenCount: (data.tokenCount as number) ?? 0,
        inputTokens: (data.inputTokens as number) ?? 0,
        outputTokens: (data.outputTokens as number) ?? 0,
        totalCost: (data.totalCost as Prisma.Decimal) ?? new Prisma.Decimal(0),
        errorCount: (data.errorCount as number) ?? 0,
        periodStart,
        periodEnd,
      },
    });
    this.logger.debug?.(`Usage incremented for ${data.modelName}`);
  }
}
