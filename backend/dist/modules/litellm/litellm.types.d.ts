export interface LiteLLMModel {
    id: string;
    object: "model";
    created: number;
    owned_by: string;
    litellm_params?: {
        model: string;
        api_key?: string;
        api_base?: string;
        custom_llm_provider?: string;
    };
    model_info?: {
        litellm_provider?: string;
        mode?: string;
        supports_function_calling?: boolean;
        supports_parallel_function_calling?: boolean;
        supports_vision?: boolean;
        supports_response_schema?: boolean;
        supports_web_search?: boolean;
        context_window?: number;
        max_output_tokens?: number;
        input_cost_per_token?: number;
        output_cost_per_token?: number;
    };
}
export interface LiteLLMModelListResponse {
    data: LiteLLMModel[];
    object: "list";
}
export interface LiteLLMHealthResponse {
    healthy_endpoints: Array<{
        model: string;
        api_base: string;
        status?: string;
    }>;
    unhealthy_endpoints: Array<{
        model: string;
        api_base: string;
        error?: string;
    }>;
}
export interface LiteLLMLivenessResponse {
    status: "healthy" | "unhealthy";
    liveness_probes?: Array<{
        model: string;
        status: string;
        error?: string;
    }>;
}
export interface LiteLLMReadinessResponse {
    status: "ready" | "not ready";
    ready_probes?: Array<{
        model: string;
        status: string;
        error?: string;
    }>;
}
export interface LiteLLMVersionResponse {
    version: string;
    git_commit?: string;
    build_date?: string;
}
export interface LiteLLMReloadResponse {
    status: "success" | "failure";
    message?: string;
}
export interface LiteLLMChatCompletionRequest {
    model: string;
    messages: Array<{
        role: string;
        content: string;
    }>;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    stream?: boolean;
    stop?: string | string[];
    presence_penalty?: number;
    frequency_penalty?: number;
    user?: string;
    metadata?: Record<string, unknown>;
}
export interface LiteLLMChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string | null;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    system_fingerprint?: string;
}
export interface LiteLLMChatCompletionChunk {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        delta: {
            role?: string;
            content?: string;
        };
        finish_reason: string | null;
    }>;
}
export interface LiteLLMConfig {
    baseUrl: string;
    masterKey: string;
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
}
export type ProviderStatusValue = "CONNECTED" | "DISCONNECTED" | "ERROR" | "UNKNOWN";
export type HealthStatusValue = "HEALTHY" | "DEGRADED" | "DOWN" | "MAINTENANCE";
export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";
export type SyncEntityType = "PROVIDERS" | "MODELS" | "CAPABILITIES" | "METADATA" | "VERSIONS" | "ALL";
export type SyncStatusValue = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "PARTIAL";
export interface LiteLLMProviderMetric {
    providerId: string;
    providerName: string;
    metricName: string;
    metricValue: number;
    metricUnit?: string;
    recordedAt: string;
}
export interface LiteLLMMetricsSummary {
    timestamp: string;
    totalProviders: number;
    activeProviders: number;
    totalModels: number;
    activeModels: number;
    healthyProviders: number;
    degradedProviders: number;
    downProviders: number;
    totalRequests: number;
    totalErrors: number;
    avgLatencyMs: number;
    cacheHitRate: number;
    circuitBreakerOpen: number;
    lastSyncAt: string | null;
}
export interface LiteLLMSyncResult {
    entityType: SyncEntityType;
    status: SyncStatusValue;
    startedAt: string;
    completedAt: string | null;
    durationMs: number;
    itemsProcessed: number;
    itemsCreated: number;
    itemsUpdated: number;
    itemsDeleted: number;
    itemsFailed: number;
    errorMessage?: string;
}
export interface LiteLLMSyncJobPayload {
    entityType: SyncEntityType;
    triggeredBy: string;
    force?: boolean;
}
export interface LiteLLMStatus {
    connected: boolean;
    proxyReachable: boolean;
    version: string | null;
    lastSyncAt: string | null;
    lastHealthCheckAt: string | null;
    providerCount: number;
    modelCount: number;
    cacheStatus: {
        connected: boolean;
        keys: number;
        memoryUsage?: string;
    };
    queueStatus: {
        waiting: number;
        active: number;
        failed: number;
    };
    circuitBreakers: Array<{
        providerId: string;
        providerName: string;
        state: CircuitBreakerState;
        failureCount: number;
        lastFailureAt: string | null;
    }>;
}
