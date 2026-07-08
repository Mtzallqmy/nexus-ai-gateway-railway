"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiteLLMModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const litellm_controller_1 = require("./litellm.controller");
const litellm_service_1 = require("./litellm.service");
const litellm_client_1 = require("./litellm.client");
const litellm_parser_1 = require("./litellm.parser");
const litellm_cache_1 = require("./litellm.cache");
const litellm_repository_1 = require("./litellm.repository");
const litellm_router_1 = require("./litellm.router");
const litellm_circuit_breaker_1 = require("./litellm.circuit-breaker");
const litellm_retry_policy_1 = require("./litellm.retry-policy");
const litellm_connection_pool_1 = require("./litellm.connection-pool");
const litellm_config_1 = require("./litellm.config");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
let LiteLLMModule = class LiteLLMModule {
};
exports.LiteLLMModule = LiteLLMModule;
exports.LiteLLMModule = LiteLLMModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, schedule_1.ScheduleModule.forRoot()],
        controllers: [litellm_controller_1.LiteLLMController],
        providers: [
            {
                provide: "LITELLM_CONFIG",
                inject: [config_1.ConfigService],
                useFactory: (config) => (0, litellm_config_1.loadLiteLLMConfig)(config),
            },
            {
                provide: litellm_circuit_breaker_1.LiteLLMCircuitBreaker,
                inject: ["LITELLM_CONFIG"],
                useFactory: (cfg) => new litellm_circuit_breaker_1.LiteLLMCircuitBreaker(cfg.circuitBreakerFailureThreshold, cfg.circuitBreakerResetTimeoutMs),
            },
            {
                provide: litellm_retry_policy_1.LiteLLMRetryPolicy,
                inject: ["LITELLM_CONFIG"],
                useFactory: (cfg) => new litellm_retry_policy_1.LiteLLMRetryPolicy(cfg.retryAttempts, cfg.retryBaseDelayMs),
            },
            {
                provide: litellm_connection_pool_1.LiteLLMConnectionPool,
                inject: ["LITELLM_CONFIG"],
                useFactory: (cfg) => new litellm_connection_pool_1.LiteLLMConnectionPool(cfg.poolMaxConnections),
            },
            {
                provide: litellm_cache_1.LiteLLMCache,
                inject: [redis_service_1.RedisService, "LITELLM_CONFIG"],
                useFactory: (redis, cfg) => new litellm_cache_1.LiteLLMCache(redis, cfg.cacheTtlSeconds),
            },
            {
                provide: litellm_client_1.LiteLLMClient,
                inject: ["LITELLM_CONFIG", litellm_retry_policy_1.LiteLLMRetryPolicy, litellm_circuit_breaker_1.LiteLLMCircuitBreaker, litellm_connection_pool_1.LiteLLMConnectionPool],
                useFactory: (cfg, retry, breaker, pool) => new litellm_client_1.LiteLLMClient(cfg, retry, breaker, pool),
            },
            litellm_parser_1.LiteLLMParser,
            litellm_repository_1.LiteLLMRepository,
            litellm_router_1.LiteLLMRouter,
            litellm_service_1.LiteLLMService,
        ],
        exports: [litellm_service_1.LiteLLMService, litellm_client_1.LiteLLMClient, litellm_router_1.LiteLLMRouter, litellm_repository_1.LiteLLMRepository],
    })
], LiteLLMModule);
//# sourceMappingURL=litellm.module.js.map