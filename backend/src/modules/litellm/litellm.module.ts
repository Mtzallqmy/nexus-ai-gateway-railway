/**
 * LiteLLM Module
 *
 * Wires together: client, parser, cache, repository, circuit breaker,
 * retry policy, connection pool, service, controller.
 *
 * Configuration is loaded from env vars via the LiteLLMConfigFactory.
 */
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { LiteLLMController } from "./litellm.controller";
import { LiteLLMService } from "./litellm.service";
import { LiteLLMClient } from "./litellm.client";
import { LiteLLMParser } from "./litellm.parser";
import { LiteLLMCache } from "./litellm.cache";
import { LiteLLMRepository } from "./litellm.repository";
import { LiteLLMRouter } from "./litellm.router";
import { LiteLLMCircuitBreaker } from "./litellm.circuit-breaker";
import { LiteLLMRetryPolicy } from "./litellm.retry-policy";
import { LiteLLMConnectionPool } from "./litellm.connection-pool";
import { loadLiteLLMConfig } from "./litellm.config";
import { RedisService } from "../../infrastructure/redis/redis.service";
import type { LiteLLMConfig } from "./litellm.types";

@Module({
  imports: [ConfigModule, ScheduleModule.forRoot()],
  controllers: [LiteLLMController],
  providers: [
    // Configuration factory
    {
      provide: "LITELLM_CONFIG",
      inject: [ConfigService],
      useFactory: (config: ConfigService): LiteLLMConfig => loadLiteLLMConfig(config),
    },
    // Cross-cutting infrastructure
    {
      provide: LiteLLMCircuitBreaker,
      inject: ["LITELLM_CONFIG"],
      useFactory: (cfg: LiteLLMConfig) =>
        new LiteLLMCircuitBreaker(cfg.circuitBreakerFailureThreshold, cfg.circuitBreakerResetTimeoutMs),
    },
    {
      provide: LiteLLMRetryPolicy,
      inject: ["LITELLM_CONFIG"],
      useFactory: (cfg: LiteLLMConfig) => new LiteLLMRetryPolicy(cfg.retryAttempts, cfg.retryBaseDelayMs),
    },
    {
      provide: LiteLLMConnectionPool,
      inject: ["LITELLM_CONFIG"],
      useFactory: (cfg: LiteLLMConfig) => new LiteLLMConnectionPool(cfg.poolMaxConnections),
    },
    {
      provide: LiteLLMCache,
      inject: [RedisService, "LITELLM_CONFIG"],
      useFactory: (redis: RedisService, cfg: LiteLLMConfig) => new LiteLLMCache(redis, cfg.cacheTtlSeconds),
    },
    // Client (needs config + retry + breaker + pool)
    {
      provide: LiteLLMClient,
      inject: ["LITELLM_CONFIG", LiteLLMRetryPolicy, LiteLLMCircuitBreaker, LiteLLMConnectionPool],
      useFactory: (cfg: LiteLLMConfig, retry: LiteLLMRetryPolicy, breaker: LiteLLMCircuitBreaker, pool: LiteLLMConnectionPool) =>
        new LiteLLMClient(cfg, retry, breaker, pool),
    },
    // Service + repository + router + parser
    LiteLLMParser,
    LiteLLMRepository,
    LiteLLMRouter,
    LiteLLMService,
  ],
  exports: [LiteLLMService, LiteLLMClient, LiteLLMRouter, LiteLLMRepository],
})
export class LiteLLMModule {}
