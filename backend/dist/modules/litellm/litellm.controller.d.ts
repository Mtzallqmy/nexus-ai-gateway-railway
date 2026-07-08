import { LiteLLMService } from "./litellm.service";
import { type SyncDto, type ListModelsQueryDto } from "./dto/litellm.dto";
export declare class LiteLLMController {
    private readonly litellm;
    constructor(litellm: LiteLLMService);
    health(): Promise<import("./litellm.types").LiteLLMHealthResponse>;
    liveness(): Promise<import("./litellm.types").LiteLLMLivenessResponse>;
    readiness(): Promise<import("./litellm.types").LiteLLMReadinessResponse>;
    version(): Promise<import("./litellm.types").LiteLLMVersionResponse>;
    models(_query: ListModelsQueryDto): Promise<import("./litellm.types").LiteLLMModelListResponse>;
    reload(): Promise<import("./litellm.types").LiteLLMReloadResponse>;
    sync(dto: SyncDto): Promise<import("./litellm.types").LiteLLMSyncResult>;
    metrics(): Promise<import("./litellm.types").LiteLLMMetricsSummary>;
    status(): Promise<import("./litellm.types").LiteLLMStatus>;
    config(): Promise<{
        baseUrl: string;
        requestTimeoutMs: number;
        streamTimeoutMs: number;
        syncIntervalMinutes: number;
        healthCheckIntervalMs: number;
        cacheTtlSeconds: number;
        circuitBreakerFailureThreshold: number;
        circuitBreakerResetTimeoutMs: number;
        retryAttempts: number;
        retryBaseDelayMs: number;
        poolMaxConnections: number;
    }>;
    callback(body: unknown): Promise<{
        received: boolean;
        body: unknown;
    }>;
}
