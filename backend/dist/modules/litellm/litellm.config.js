"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadLiteLLMConfig = loadLiteLLMConfig;
const litellm_constants_1 = require("./litellm.constants");
function loadLiteLLMConfig(config) {
    return Object.freeze({
        baseUrl: (config.get("app.litellm.baseUrl") ?? "http://localhost:4000").replace(/\/$/, ""),
        masterKey: config.get("app.litellm.masterKey") ?? "",
        requestTimeoutMs: config.get("app.litellm.requestTimeoutMs") ?? litellm_constants_1.LITELLM_DEFAULTS.REQUEST_TIMEOUT_MS,
        streamTimeoutMs: config.get("app.litellm.streamTimeoutMs") ?? litellm_constants_1.LITELLM_DEFAULTS.STREAM_TIMEOUT_MS,
        syncIntervalMinutes: config.get("app.litellm.syncIntervalMinutes") ?? 5,
        healthCheckIntervalMs: config.get("app.litellm.healthCheckIntervalMs") ?? litellm_constants_1.LITELLM_DEFAULTS.HEALTH_CHECK_INTERVAL_MS,
        cacheTtlSeconds: config.get("app.litellm.cacheTtlSeconds") ?? litellm_constants_1.LITELLM_DEFAULTS.CACHE_TTL_SECONDS,
        circuitBreakerFailureThreshold: config.get("app.litellm.circuitBreakerFailureThreshold") ?? litellm_constants_1.LITELLM_DEFAULTS.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
        circuitBreakerResetTimeoutMs: config.get("app.litellm.circuitBreakerResetTimeoutMs") ?? litellm_constants_1.LITELLM_DEFAULTS.CIRCUIT_BREAKER_RESET_TIMEOUT_MS,
        retryAttempts: config.get("app.litellm.retryAttempts") ?? litellm_constants_1.LITELLM_DEFAULTS.RETRY_ATTEMPTS,
        retryBaseDelayMs: config.get("app.litellm.retryBaseDelayMs") ?? litellm_constants_1.LITELLM_DEFAULTS.RETRY_BASE_DELAY_MS,
        poolMaxConnections: config.get("app.litellm.poolMaxConnections") ?? litellm_constants_1.LITELLM_DEFAULTS.POOL_MAX_CONNECTIONS,
    });
}
//# sourceMappingURL=litellm.config.js.map