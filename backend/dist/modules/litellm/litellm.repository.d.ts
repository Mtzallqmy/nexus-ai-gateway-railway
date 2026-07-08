import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { ILiteLLMRepository } from "./litellm.interfaces";
export declare class LiteLLMRepository implements ILiteLLMRepository {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    upsertProvider(data: Record<string, unknown>): Promise<{
        type: import(".prisma/client").$Enums.ProviderType;
        isActive: boolean;
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.ProviderConnectionStatus;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        metadata: Prisma.JsonValue;
        litellmId: string;
        baseUrl: string | null;
        supportedFeatures: string[];
        region: string | null;
        lastSyncedAt: Date | null;
    }>;
    findProviders(filter?: Record<string, unknown>): Promise<{
        type: import(".prisma/client").$Enums.ProviderType;
        isActive: boolean;
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.ProviderConnectionStatus;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        metadata: Prisma.JsonValue;
        litellmId: string;
        baseUrl: string | null;
        supportedFeatures: string[];
        region: string | null;
        lastSyncedAt: Date | null;
    }[]>;
    findProviderById(id: string): Promise<{
        type: import(".prisma/client").$Enums.ProviderType;
        isActive: boolean;
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.ProviderConnectionStatus;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        metadata: Prisma.JsonValue;
        litellmId: string;
        baseUrl: string | null;
        supportedFeatures: string[];
        region: string | null;
        lastSyncedAt: Date | null;
    } | null>;
    upsertModel(data: Record<string, unknown>): Promise<{
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        metadata: Prisma.JsonValue;
        lastSyncedAt: Date | null;
        providerId: string;
        modelName: string;
        litellmModelId: string;
        displayName: string;
        contextWindow: number | null;
        maxOutput: number | null;
        inputPricePer1k: Prisma.Decimal | null;
        outputPricePer1k: Prisma.Decimal | null;
        capabilities: string[];
        modalities: string[];
    }>;
    findModels(filter?: Record<string, unknown>): Promise<({
        provider: {
            type: import(".prisma/client").$Enums.ProviderType;
            name: string;
            id: string;
            slug: string;
        };
    } & {
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        metadata: Prisma.JsonValue;
        lastSyncedAt: Date | null;
        providerId: string;
        modelName: string;
        litellmModelId: string;
        displayName: string;
        contextWindow: number | null;
        maxOutput: number | null;
        inputPricePer1k: Prisma.Decimal | null;
        outputPricePer1k: Prisma.Decimal | null;
        capabilities: string[];
        modalities: string[];
    })[]>;
    deleteStaleModels(activeIds: string[]): Promise<number>;
    recordSync(data: Record<string, unknown>): Promise<{
        id: string;
        details: Prisma.JsonValue;
        status: import(".prisma/client").$Enums.SyncStatus;
        createdAt: Date;
        errorMessage: string | null;
        entityType: import(".prisma/client").$Enums.SyncEntityType;
        startedAt: Date;
        completedAt: Date | null;
        durationMs: number;
        itemsProcessed: number;
        itemsCreated: number;
        itemsUpdated: number;
        itemsDeleted: number;
        itemsFailed: number;
        triggeredBy: string;
    }>;
    findSyncHistory(filter?: Record<string, unknown>, limit?: number): Promise<{
        id: string;
        details: Prisma.JsonValue;
        status: import(".prisma/client").$Enums.SyncStatus;
        createdAt: Date;
        errorMessage: string | null;
        entityType: import(".prisma/client").$Enums.SyncEntityType;
        startedAt: Date;
        completedAt: Date | null;
        durationMs: number;
        itemsProcessed: number;
        itemsCreated: number;
        itemsUpdated: number;
        itemsDeleted: number;
        itemsFailed: number;
        triggeredBy: string;
    }[]>;
    recordHealthCheck(data: Record<string, unknown>): Promise<{
        id: string;
        details: Prisma.JsonValue;
        status: import(".prisma/client").$Enums.HealthStatus;
        errorMessage: string | null;
        latencyMs: number;
        providerId: string;
        checkType: import(".prisma/client").$Enums.HealthCheckType;
        circuitState: import(".prisma/client").$Enums.CircuitBreakerState;
        checkedAt: Date;
    }>;
    findLatestHealth(providerId: string): Promise<{
        id: string;
        details: Prisma.JsonValue;
        status: import(".prisma/client").$Enums.HealthStatus;
        errorMessage: string | null;
        latencyMs: number;
        providerId: string;
        checkType: import(".prisma/client").$Enums.HealthCheckType;
        circuitState: import(".prisma/client").$Enums.CircuitBreakerState;
        checkedAt: Date;
    } | null>;
    recordMetric(data: Record<string, unknown>): Promise<{
        id: string;
        providerId: string;
        metricName: string;
        metricValue: number;
        metricUnit: string | null;
        labels: Prisma.JsonValue;
        recordedAt: Date;
    }>;
    aggregateMetrics(providerId?: string): Promise<(Prisma.PickEnumerable<Prisma.ProviderMetricGroupByOutputType, "metricName"[]> & {
        _count: {
            metricValue: number;
        };
        _avg: {
            metricValue: number | null;
        };
        _min: {
            metricValue: number | null;
        };
        _max: {
            metricValue: number | null;
        };
    })[]>;
    incrementUsage(data: Record<string, unknown>): Promise<void>;
}
