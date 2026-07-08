/**
 * LiteLLM Module — Constants
 *
 * All hardcoded values, route paths, header names, queue names,
 * cache key prefixes, and default timeout values live here.
 */

// ============================================================
// LITELLM PROXY ENDPOINTS (LiteLLM's own API surface)
// ============================================================
export const LITELLM_ENDPOINTS = {
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
  RELOAD: "/admin/endpoints", // POST to reload config
  CACHE_FLUSH: "/cache/purge",
  MODEL_INFO: "/v1/models/info",
  MODEL_GROUP_INFO: "/model_group/info",
} as const;

// ============================================================
// HTTP HEADERS
// ============================================================
export const LITELLM_HEADERS = {
  AUTHORIZATION: "Authorization",
  API_KEY: "X-Litellm-Api-Key",
  CONTENT_TYPE: "Content-Type",
  ACCEPT: "Accept",
  USER_AGENT: "User-Agent",
  REQUEST_ID: "X-Request-Id",
} as const;

// ============================================================
// CACHE KEY PREFIXES (used with RedisService)
// ============================================================
export const LITELLM_CACHE_KEYS = {
  MODELS: "litellm:models",
  MODEL: (id: string) => `litellm:models:${id}`,
  PROVIDERS: "litellm:providers",
  PROVIDER: (id: string) => `litellm:providers:${id}`,
  HEALTH: "litellm:health",
  HEALTH_PROVIDER: (id: string) => `litellm:health:${id}`,
  VERSION: "litellm:version",
  METRICS: "litellm:metrics",
  STATUS: "litellm:status",
  CONFIG: "litellm:config",
} as const;

// ============================================================
// QUEUE NAMES (BullMQ)
// ============================================================
export const LITELLM_QUEUES = {
  SYNC: "litellm-sync",
  HEALTH_CHECK: "litellm-health-check",
  METRICS: "litellm-metrics",
  CALLBACK: "litellm-callback",
} as const;

// ============================================================
// JOB NAMES
// ============================================================
export const LITELLM_JOBS = {
  SYNC_PROVIDERS: "sync-providers",
  SYNC_MODELS: "sync-models",
  SYNC_CAPABILITIES: "sync-capabilities",
  SYNC_METADATA: "sync-metadata",
  SYNC_VERSIONS: "sync-versions",
  SYNC_ALL: "sync-all",
  HEALTH_CHECK: "health-check",
  COLLECT_METRICS: "collect-metrics",
  PROCESS_CALLBACK: "process-callback",
} as const;

// ============================================================
// DEFAULT TIMEOUTS & LIMITS (in milliseconds)
// ============================================================
export const LITELLM_DEFAULTS = {
  REQUEST_TIMEOUT_MS: 30_000,
  STREAM_TIMEOUT_MS: 60_000,
  HEALTH_CHECK_INTERVAL_MS: 30_000,
  SYNC_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
  CACHE_TTL_SECONDS: 300, // 5 minutes
  RETRY_ATTEMPTS: 3,
  RETRY_BASE_DELAY_MS: 500,
  RETRY_MAX_DELAY_MS: 5_000,
  CIRCUIT_BREAKER_FAILURE_THRESHOLD: 5,
  CIRCUIT_BREAKER_RESET_TIMEOUT_MS: 60_000,
  POOL_MAX_CONNECTIONS: 50,
  POOL_KEEP_ALIVE_MS: 30_000,
} as const;

// ============================================================
// MODULE TOKENS (for DI)
// ============================================================
export const LITELLM_TOKENS = {
  CONFIG: "LITELLM_CONFIG",
  CLIENT: "LITELLM_CLIENT",
  REPOSITORY: "LITELLM_REPOSITORY",
  CACHE: "LITELLM_CACHE",
  LOGGER: "LITELLM_LOGGER",
} as const;

// ============================================================
// LOG CONTEXTS
// ============================================================
export const LITELLM_LOG_CONTEXTS = {
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
} as const;
