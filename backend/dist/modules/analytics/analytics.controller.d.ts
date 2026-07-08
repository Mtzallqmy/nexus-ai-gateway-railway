import { AnalyticsService, type AnalyticsQuery } from "./analytics.service";
export declare class AnalyticsController {
    private readonly analytics;
    constructor(analytics: AnalyticsService);
    usage(query: AnalyticsQuery): Promise<{
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
            totalCost: import(".prisma/client/runtime/library").Decimal;
        };
        timeline: Record<string, unknown>[];
    }>;
    requests(query: AnalyticsQuery): Promise<{
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
    providers(query: AnalyticsQuery): Promise<{
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
    models(query: AnalyticsQuery): Promise<{
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
    cost(query: AnalyticsQuery): Promise<{
        summary: {
            totalCost: import(".prisma/client/runtime/library").Decimal;
            totalEstimated: import(".prisma/client/runtime/library").Decimal;
            totalReal: import(".prisma/client/runtime/library").Decimal;
        };
        byProvider: Record<string, number[]>;
        byModel: Record<string, number[]>;
        timeline: Record<string, unknown>[];
    }>;
    latency(query: AnalyticsQuery): Promise<{
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
    errors(query: AnalyticsQuery): Promise<{
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
    users(query: AnalyticsQuery): Promise<{
        userId: string | null;
        requests: number;
        tokens: number;
        cost: number;
        errors: number;
    }[]>;
    organizations(query: AnalyticsQuery): Promise<{
        organizationId: string | null;
        requests: number;
        tokens: number;
        cost: number;
        errors: number;
    }[]>;
    apiKeys(query: AnalyticsQuery): Promise<{
        apiKeyId: string | null;
        requests: number;
        tokens: number;
        cost: number;
        errors: number;
    }[]>;
    executiveDashboard(): Promise<{
        timestamp: string;
        periods: {
            last24h: {
                requests: number;
                tokens: number;
                cost: import(".prisma/client/runtime/library").Decimal;
                errors: number;
                successes: number;
                errorRate: number;
                successRate: number;
                avgLatencyMs: number;
            };
            last7d: {
                requests: number;
                tokens: number;
                cost: import(".prisma/client/runtime/library").Decimal;
                errors: number;
                successes: number;
                errorRate: number;
                successRate: number;
                avgLatencyMs: number;
            };
            last30d: {
                requests: number;
                tokens: number;
                cost: import(".prisma/client/runtime/library").Decimal;
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
            notifications: import(".prisma/client/runtime/library").JsonValue;
            status: import(".prisma/client").$Enums.AlertStatus;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            metadata: import(".prisma/client/runtime/library").JsonValue;
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
        totalRevenue: import(".prisma/client/runtime/library").Decimal;
    }>;
}
