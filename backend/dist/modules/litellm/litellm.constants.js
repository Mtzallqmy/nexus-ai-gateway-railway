"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LITELLM_LOG_CONTEXTS = exports.LITELLM_TOKENS = exports.LITELLM_DEFAULTS = exports.LITELLM_JOBS = exports.LITELLM_QUEUES = exports.LITELLM_CACHE_KEYS = exports.LITELLM_HEADERS = exports.LITELLM_ENDPOINTS = void 0;
exports.LITELLM_ENDPOINTS = {
    HEALTH_LIVENESS: "/health/liveness",
    HEALTH_READINESS: "/health/readiness",
    HEALTH_FULL: "/health",
    VERSION: "/version",
    MODELS: "/v1/models",
    CHAT_COMPLETIONS: "/v1/chat/completions",
    COMPLETIONS: "/v1/completions",
    EMBEDDINGS: "/v1/embeddings",
    KEY_GENERATE: "/key/generate",
    KEY_LIST: "/key/list",
    KEY_INFO: "/key/info",
    RELOAD: "/admin/endpoints",
    CACHE_FLUSH: "/cache/purge",
    MODEL_INFO: "/v1/models/info",
    MODEL_GROUP_INFO: "/model_group/info",
};
exports.LITELLM_HEADERS = {
    AUTHORIZATION: "Authorization",
    API_KEY: "X-Litellm-Api-Key",
    CONTENT_TYPE: "Content-Type",
    ACCEPT: "Accept",
    USER_AGENT: "User-Agent",
    REQUEST_ID: "X-Request-Id",
};
exports.LITELLM_CACHE_KEYS = {
    MODELS: "litellm:models",
    MODEL: (id) => `litellm:models:${id}`,
    PROVIDERS: "litellm:providers",
    PROVIDER: (id) => `litellm:providers:${id}`,
    HEALTH: "litellm:health",
    HEALTH_PROVIDER: (id) => `litellm:health:${id}`,
    VERSION: "litellm:version",
    METRICS: "litellm:metrics",
    STATUS: "litellm:status",
    CONFIG: "litellm:config",
};
exports.LITELLM_QUEUES = {
    SYNC: "litellm-sync",
    HEALTH_CHECK: "litellm-health-check",
    METRICS: "litellm-metrics",
    CALLBACK: "litellm-callback",
};
exports.LITELLM_JOBS = {
    SYNC_PROVIDERS: "sync-providers",
    SYNC_MODELS: "sync-models",
    SYNC_CAPABILITIES: "sync-capabilities",
    SYNC_METADATA: "sync-metadata",
    SYNC_VERSIONS: "sync-versions",
    SYNC_ALL: "sync-all",
    HEALTH_CHECK: "health-check",
    COLLECT_METRICS: "collect-metrics",
    PROCESS_CALLBACK: "process-callback",
};
exports.LITELLM_DEFAULTS = {
    REQUEST_TIMEOUT_MS: 30_000,
    STREAM_TIMEOUT_MS: 60_000,
    HEALTH_CHECK_INTERVAL_MS: 30_000,
    SYNC_INTERVAL_MS: 5 * 60 * 1000,
    CACHE_TTL_SECONDS: 300,
    RETRY_ATTEMPTS: 3,
    RETRY_BASE_DELAY_MS: 500,
    RETRY_MAX_DELAY_MS: 5_000,
    CIRCUIT_BREAKER_FAILURE_THRESHOLD: 5,
    CIRCUIT_BREAKER_RESET_TIMEOUT_MS: 60_000,
    POOL_MAX_CONNECTIONS: 50,
    POOL_KEEP_ALIVE_MS: 30_000,
};
exports.LITELLM_TOKENS = {
    CONFIG: "LITELLM_CONFIG",
    CLIENT: "LITELLM_CLIENT",
    REPOSITORY: "LITELLM_REPOSITORY",
    CACHE: "LITELLM_CACHE",
    LOGGER: "LITELLM_LOGGER",
};
exports.LITELLM_LOG_CONTEXTS = {
    CLIENT: "LiteLLMClient",
    SERVICE: "LiteLLMService",
    CONTROLLER: "LiteLLMController",
    REPOSITORY: "LiteLLMRepository",
    ROUTER: "LiteLLMRouter",
    PARSER: "LiteLLMParser",
    STREAM: "LiteLLMStream",
    HEALTH: "LiteLLMHealth",
    METRICS: "LiteLLMMetrics",
    SYNC: "LiteLLMSync",
    CACHE: "LiteLLMCache",
    CIRCUIT: "LiteLLMCircuitBreaker",
    POOL: "LiteLLMConnectionPool",
};
//# sourceMappingURL=litellm.constants.js.map