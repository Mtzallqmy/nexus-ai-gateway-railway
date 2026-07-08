import type { LiteLLMConfig } from "./litellm.types";
import type { LiteLLMChatCompletionRequest, LiteLLMChatCompletionResponse, LiteLLMChatCompletionChunk, LiteLLMHealthResponse, LiteLLMLivenessResponse, LiteLLMReadinessResponse, LiteLLMModelListResponse, LiteLLMVersionResponse, LiteLLMReloadResponse } from "./litellm.types";
export interface ILiteLLMClient {
    getModels(): Promise<LiteLLMModelListResponse>;
    getVersion(): Promise<LiteLLMVersionResponse>;
    getHealthLiveness(): Promise<LiteLLMLivenessResponse>;
    getHealthReadiness(): Promise<LiteLLMReadinessResponse>;
    getHealthFull(): Promise<LiteLLMHealthResponse>;
    reload(): Promise<LiteLLMReloadResponse>;
    chatCompletion(req: LiteLLMChatCompletionRequest): Promise<LiteLLMChatCompletionResponse>;
    chatCompletionStream(req: LiteLLMChatCompletionRequest): AsyncIterable<LiteLLMChatCompletionChunk>;
    embeddings(model: string, input: string | string[]): Promise<unknown>;
}
export interface ILiteLLMRepository {
    upsertProvider(data: Record<string, unknown>): Promise<unknown>;
    findProviders(filter?: Record<string, unknown>): Promise<unknown[]>;
    findProviderById(id: string): Promise<unknown | null>;
    upsertModel(data: Record<string, unknown>): Promise<unknown>;
    findModels(filter?: Record<string, unknown>): Promise<unknown[]>;
    deleteStaleModels(activeIds: string[]): Promise<number>;
    recordSync(data: Record<string, unknown>): Promise<unknown>;
    findSyncHistory(filter?: Record<string, unknown>, limit?: number): Promise<unknown[]>;
    recordHealthCheck(data: Record<string, unknown>): Promise<unknown>;
    findLatestHealth(providerId: string): Promise<unknown | null>;
    recordMetric(data: Record<string, unknown>): Promise<unknown>;
    aggregateMetrics(providerId?: string): Promise<unknown>;
    incrementUsage(data: Record<string, unknown>): Promise<void>;
}
export interface ILiteLLMCache {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    del(...keys: string[]): Promise<number>;
    flushPattern(pattern: string): Promise<number>;
}
export interface ILiteLLMRouter {
    routeChatCompletion(req: LiteLLMChatCompletionRequest): Promise<LiteLLMChatCompletionResponse>;
    routeChatCompletionStream(req: LiteLLMChatCompletionRequest): AsyncIterable<LiteLLMChatCompletionChunk>;
    routeEmbeddings(model: string, input: string | string[]): Promise<unknown>;
}
export interface ILiteLLMHealthChecker {
    checkLiveness(): Promise<LiteLLMLivenessResponse>;
    checkReadiness(): Promise<LiteLLMReadinessResponse>;
    checkFull(): Promise<LiteLLMHealthResponse>;
}
export interface ILiteLLMMetricsCollector {
    collect(): Promise<unknown>;
    getSummary(): Promise<unknown>;
    recordProviderMetric(providerId: string, name: string, value: number, unit?: string): Promise<void>;
}
export interface ILiteLLMSyncService {
    syncAll(triggeredBy?: string): Promise<unknown>;
    syncProviders(triggeredBy?: string): Promise<unknown>;
    syncModels(triggeredBy?: string): Promise<unknown>;
    syncCapabilities(triggeredBy?: string): Promise<unknown>;
    syncMetadata(triggeredBy?: string): Promise<unknown>;
    syncVersions(triggeredBy?: string): Promise<unknown>;
    getSyncHistory(limit?: number): Promise<unknown[]>;
}
export interface ICircuitBreaker {
    getState(providerKey: string): "CLOSED" | "OPEN" | "HALF_OPEN";
    recordSuccess(providerKey: string): void;
    recordFailure(providerKey: string): boolean;
    isOpen(providerKey: string): boolean;
    reset(providerKey?: string): void;
    getAll(): Array<{
        key: string;
        state: "CLOSED" | "OPEN" | "HALF_OPEN";
        failureCount: number;
        lastFailureAt: string | null;
    }>;
}
export interface IRetryPolicy {
    shouldRetry(attempt: number, error: unknown): boolean;
    getDelay(attempt: number): number;
    getMaxAttempts(): number;
}
export interface IConnectionPool {
    acquire(): Promise<unknown>;
    release(resource: unknown): void;
    getStats(): {
        active: number;
        idle: number;
        max: number;
        waiting: number;
    };
}
export type LiteLLMConfigFactory = () => LiteLLMConfig;
