/**
 * LiteLLM Configuration Loader
 *
 * Reads all LiteLLM-related env vars via ConfigService,
 * applies defaults, and returns a frozen LiteLLMConfig object.
 */
import { ConfigService } from "@nestjs/config";
import { LITELLM_DEFAULTS } from "./litellm.constants";
import type { LiteLLMConfig } from "./litellm.types";

export function loadLiteLLMConfig(config: ConfigService): LiteLLMConfig {
  return Object.freeze({
    baseUrl: (config.get<string>("app.litellm.baseUrl") ?? "http://localhost:4000").replace(/\/$/, ""),
    masterKey: config.get<string>("app.litellm.masterKey") ?? "",
    requestTimeoutMs: config.get<number>("app.litellm.requestTimeoutMs") ?? LITELLM_DEFAULTS.REQUEST_TIMEOUT_MS,
    streamTimeoutMs: config.get<number>("app.litellm.streamTimeoutMs") ?? LITELLM_DEFAULTS.STREAM_TIMEOUT_MS,
    syncIntervalMinutes: config.get<number>("app.litellm.syncIntervalMinutes") ?? 5,
    healthCheckIntervalMs: config.get<number>("app.litellm.healthCheckIntervalMs") ?? LITELLM_DEFAULTS.HEALTH_CHECK_INTERVAL_MS,
    cacheTtlSeconds: config.get<number>("app.litellm.cacheTtlSeconds") ?? LITELLM_DEFAULTS.CACHE_TTL_SECONDS,
    circuitBreakerFailureThreshold:
      config.get<number>("app.litellm.circuitBreakerFailureThreshold") ?? LITELLM_DEFAULTS.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
    circuitBreakerResetTimeoutMs:
      config.get<number>("app.litellm.circuitBreakerResetTimeoutMs") ?? LITELLM_DEFAULTS.CIRCUIT_BREAKER_RESET_TIMEOUT_MS,
    retryAttempts: config.get<number>("app.litellm.retryAttempts") ?? LITELLM_DEFAULTS.RETRY_ATTEMPTS,
    retryBaseDelayMs: config.get<number>("app.litellm.retryBaseDelayMs") ?? LITELLM_DEFAULTS.RETRY_BASE_DELAY_MS,
    poolMaxConnections: config.get<number>("app.litellm.poolMaxConnections") ?? LITELLM_DEFAULTS.POOL_MAX_CONNECTIONS,
  });
}

export type { LiteLLMConfig };
