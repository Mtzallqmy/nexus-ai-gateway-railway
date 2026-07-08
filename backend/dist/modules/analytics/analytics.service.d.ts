import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
export interface AnalyticsQuery {
    startDate?: string;
    endDate?: string;
    providerName?: string;
    modelName?: string;
    organizationId?: string;
    userId?: string;
    granularity?: "hour" | "day" | "week" | "month";
}
export declare class AnalyticsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getUsageAnalytics(query: AnalyticsQuery): Promise<{
        summary: {
            totalRequests: number;
            totalInputTokens: number;
            totalOutputTokens: number;
            totalCachedTokens: number;
            totalTokens: number;
            totalStreamingSessions: number;
            totalImages: number;
            totalEmbeddings: number;
            totalSpeech: number;
            totalVision: number;
            totalModeration: number;
            totalCost: Prisma.Decimal;
        };
        timeline: Record<string, unknown>[];
    }>;
    getRequestAnalytics(query: AnalyticsQuery): Promise<{
        byProvider: {
            provider: string;
            requests: number;
            errors: number;
        }[];
        byModel: {
            model: string;
            requests: number;
            errors: number;
        }[];
        byEndpoint: {
            endpoint: string;
            requests: number;
        }[];
        byMethod: {
            method: string;
            requests: number;
        }[];
    }>;
    getProviderAnalytics(query: AnalyticsQuery): Promise<{
        provider: string;
        requests: number;
        tokens: number;
        cost: number;
        errors: number;
        successes: number;
        errorRate: number;
        successRate: number;
        avgLatencyMs: number;
    }[]>;
    getModelAnalytics(query: AnalyticsQuery): Promise<{
        model: string;
        provider: string;
        requests: number;
        tokens: number;
        cost: number;
        errors: number;
        avgLatencyMs: number;
        avgCostPerRequest: number;
        avgTokensPerRequest: number;
    }[]>;
    getCostAnalytics(query: AnalyticsQuery): Promise<{
        summary: {
            totalCost: Prisma.Decimal;
            totalEstimated: Prisma.Decimal;
            totalReal: Prisma.Decimal;
        };
        byProvider: Record<string, number[]>;
        byModel: Record<string, number[]>;
        timeline: Record<string, unknown>[];
    }>;
    getLatencyAnalytics(query: AnalyticsQuery): Promise<{
        summary: {
            avg: number;
            p50: number;
            p95: number;
            p99: number;
            min: number;
            max: number;
        };
        byProvider: {
            provider: string;
            avg: number;
            p50: number;
            p95: number;
        }[];
        timeline: Record<string, unknown>[];
    }>;
    getErrorAnalytics(query: AnalyticsQuery): Promise<{
        summary: {
            totalErrors: number;
            totalRequests: number;
            totalSuccesses: number;
            errorRate: number;
            successRate: number;
            failureRate: number;
        };
        byProvider: Record<string, number[]>;
        timeline: Record<string, unknown>[];
    }>;
    getUserAnalytics(query: AnalyticsQuery): Promise<{
        userId: string | null;
        requests: number;
        tokens: number;
        cost: number;
        errors: number;
    }[]>;
    getOrganizationAnalytics(query: AnalyticsQuery): Promise<{
        organizationId: string | null;
        requests: number;
        tokens: number;
        cost: number;
        errors: number;
    }[]>;
    getApiAnalytics(query: AnalyticsQuery): Promise<{
        apiKeyId: string | null;
        requests: number;
        tokens: number;
        cost: number;
        errors: number;
    }[]>;
    getExecutiveDashboard(): Promise<{
        timestamp: string;
        periods: {
            last24h: {
                requests: number;
                tokens: number;
                cost: Prisma.Decimal;
                errors: number;
                successes: number;
                errorRate: number;
                successRate: number;
                avgLatencyMs: number;
            };
            last7d: {
                requests: number;
                tokens: number;
                cost: Prisma.Decimal;
                errors: number;
                successes: number;
                errorRate: number;
                successRate: number;
                avgLatencyMs: number;
            };
            last30d: {
                requests: number;
                tokens: number;
                cost: Prisma.Decimal;
                errors: number;
                successes: number;
                errorRate: number;
                successRate: number;
                avgLatencyMs: number;
            };
        };
        topProviders: {
            provider: string;
            requests: number;
            tokens: number;
            cost: number;
            errors: number;
            successes: number;
            errorRate: number;
            successRate: number;
            avgLatencyMs: number;
        }[];
        topModels: {
            model: string;
            provider: string;
            requests: number;
            tokens: number;
            cost: number;
            errors: number;
            avgLatencyMs: number;
            avgCostPerRequest: number;
            avgTokensPerRequest: number;
        }[];
        recentAlerts: {
            message: string;
            type: string;
            name: string;
            id: string;
            notifications: Prisma.JsonValue;
            status: import(".prisma/client").$Enums.AlertStatus;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            metadata: Prisma.JsonValue;
            resourceId: string | null;
            resourceName: string | null;
            severity: import(".prisma/client").$Enums.AlertSeverity;
            source: string;
            currentValue: string | null;
            threshold: string | null;
            acknowledgedBy: string | null;
            acknowledgedAt: Date | null;
            resolvedAt: Date | null;
            resolvedBy: string | null;
            resolvedReason: string | null;
            triggeredAt: Date;
        }[];
        activeSubscriptions: number;
        totalRevenue: Prisma.Decimal;
    }>;
    private getSummary;
    private buildWhere;
    private buildTimeline;
    private bucketKey;
    private groupBy;
    private percentile;
    private sumDecimal;
}
