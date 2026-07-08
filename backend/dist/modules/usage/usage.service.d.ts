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
export declare class UsageService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    record(input: UsageRecordInput): Promise<void>;
    getUsageSummary(organizationId?: string, startDate?: Date, endDate?: Date): Promise<{
        records: number;
        requests: number;
        responses: number;
        inputTokens: number;
        outputTokens: number;
        cachedTokens: number;
        totalTokens: number;
        streamingSessions: number;
        images: number;
        embeddings: number;
        speech: number;
        vision: number;
        moderation: number;
        cost: Prisma.Decimal;
        errors: number;
        successes: number;
    }>;
    getUsageByType(organizationId?: string, startDate?: Date, endDate?: Date): Promise<{
        streaming: number;
        images: number;
        embeddings: number;
        speech: number;
        vision: number;
        moderation: number;
    }>;
}
