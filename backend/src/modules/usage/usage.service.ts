/**
 * Usage Tracking Service — Records and aggregates usage data.
 * Tracks: requests, responses, tokens (input/output/cached), streaming sessions,
 * images, embeddings, speech, vision, moderation.
 */
import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

export interface UsageRecordInput {
  organizationId?: string;
  userId?: string;
  apiKeyId?: string;
  providerName: string;
  modelName: string;
  endpoint: string;
  method: string;
  requestCount?: number;
  responseCount?: number;
  inputTokens?: number;
  outputTokens?: number;
  cachedTokens?: number;
  streamingSessions?: number;
  imageCount?: number;
  embeddingCount?: number;
  speechCount?: number;
  visionCount?: number;
  moderationCount?: number;
  cost?: number;
  estimatedCost?: number;
  realCost?: number;
  latencyMs?: number;
  errorCount?: number;
  successCount?: number;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class UsageService {
  private readonly logger = new Logger("UsageService");

  constructor(private readonly prisma: PrismaService) {
    this.logger.log("Usage tracking service initialized");
  }

  async record(input: UsageRecordInput): Promise<void> {
    const now = new Date();
    const periodStart = new Date(Math.floor(now.getTime() / 60000) * 60000); // 1-min bucket
    const periodEnd = new Date(periodStart.getTime() + 60000);

    const totalTokens = (input.inputTokens ?? 0) + (input.outputTokens ?? 0) + (input.cachedTokens ?? 0);

    await this.prisma.usageRecord.create({
      data: {
        organizationId: input.organizationId ?? null,
        userId: input.userId ?? null,
        apiKeyId: input.apiKeyId ?? null,
        providerName: input.providerName,
        modelName: input.modelName,
        endpoint: input.endpoint,
        method: input.method,
        requestCount: input.requestCount ?? 1,
        responseCount: input.responseCount ?? 0,
        inputTokens: input.inputTokens ?? 0,
        outputTokens: input.outputTokens ?? 0,
        cachedTokens: input.cachedTokens ?? 0,
        totalTokens,
        streamingSessions: input.streamingSessions ?? 0,
        imageCount: input.imageCount ?? 0,
        embeddingCount: input.embeddingCount ?? 0,
        speechCount: input.speechCount ?? 0,
        visionCount: input.visionCount ?? 0,
        moderationCount: input.moderationCount ?? 0,
        cost: new Prisma.Decimal(input.cost ?? 0),
        estimatedCost: new Prisma.Decimal(input.estimatedCost ?? input.cost ?? 0),
        realCost: new Prisma.Decimal(input.realCost ?? input.cost ?? 0),
        latencyMs: input.latencyMs ?? 0,
        errorCount: input.errorCount ?? 0,
        successCount: input.successCount ?? 0,
        periodStart,
        periodEnd,
        metadata: (input.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });
  }

  async getUsageSummary(organizationId?: string, startDate?: Date, endDate?: Date) {
    const where: Prisma.UsageRecordWhereInput = {};
    if (organizationId) where.organizationId = organizationId;
    if (startDate || endDate) {
      where.periodStart = {};
      if (startDate) where.periodStart.gte = startDate;
      if (endDate) where.periodStart.lte = endDate;
    }

    const aggregated = await this.prisma.usageRecord.aggregate({
      where,
      _sum: {
        requestCount: true,
        responseCount: true,
        inputTokens: true,
        outputTokens: true,
        cachedTokens: true,
        totalTokens: true,
        streamingSessions: true,
        imageCount: true,
        embeddingCount: true,
        speechCount: true,
        visionCount: true,
        moderationCount: true,
        cost: true,
        errorCount: true,
        successCount: true,
      },
      _count: { id: true },
    });

    return {
      records: aggregated._count.id,
      requests: aggregated._sum.requestCount ?? 0,
      responses: aggregated._sum.responseCount ?? 0,
      inputTokens: aggregated._sum.inputTokens ?? 0,
      outputTokens: aggregated._sum.outputTokens ?? 0,
      cachedTokens: aggregated._sum.cachedTokens ?? 0,
      totalTokens: aggregated._sum.totalTokens ?? 0,
      streamingSessions: aggregated._sum.streamingSessions ?? 0,
      images: aggregated._sum.imageCount ?? 0,
      embeddings: aggregated._sum.embeddingCount ?? 0,
      speech: aggregated._sum.speechCount ?? 0,
      vision: aggregated._sum.visionCount ?? 0,
      moderation: aggregated._sum.moderationCount ?? 0,
      cost: aggregated._sum.cost ?? new Prisma.Decimal(0),
      errors: aggregated._sum.errorCount ?? 0,
      successes: aggregated._sum.successCount ?? 0,
    };
  }

  async getUsageByType(organizationId?: string, startDate?: Date, endDate?: Date) {
    const where: Prisma.UsageRecordWhereInput = {};
    if (organizationId) where.organizationId = organizationId;
    if (startDate || endDate) {
      where.periodStart = {};
      if (startDate) where.periodStart.gte = startDate;
      if (endDate) where.periodStart.lte = endDate;
    }

    const aggregated = await this.prisma.usageRecord.aggregate({
      where,
      _sum: {
        streamingSessions: true,
        imageCount: true,
        embeddingCount: true,
        speechCount: true,
        visionCount: true,
        moderationCount: true,
      },
    });

    return {
      streaming: aggregated._sum.streamingSessions ?? 0,
      images: aggregated._sum.imageCount ?? 0,
      embeddings: aggregated._sum.embeddingCount ?? 0,
      speech: aggregated._sum.speechCount ?? 0,
      vision: aggregated._sum.visionCount ?? 0,
      moderation: aggregated._sum.moderationCount ?? 0,
    };
  }
}
