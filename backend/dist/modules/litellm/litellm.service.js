"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiteLLMService = void 0;
const common_1 = require("@nestjs/common");
const litellm_constants_1 = require("./litellm.constants");
const litellm_parser_1 = require("./litellm.parser");
const litellm_cache_1 = require("./litellm.cache");
const litellm_circuit_breaker_1 = require("./litellm.circuit-breaker");
const litellm_connection_pool_1 = require("./litellm.connection-pool");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let LiteLLMService = class LiteLLMService {
    config;
    client;
    parser;
    cache;
    repo;
    breaker;
    pool;
    prisma;
    logger = new common_1.Logger(litellm_constants_1.LITELLM_LOG_CONTEXTS.SERVICE);
    constructor(config, client, parser, cache, repo, breaker, pool, prisma) {
        this.config = config;
        this.client = client;
        this.parser = parser;
        this.cache = cache;
        this.repo = repo;
        this.breaker = breaker;
        this.pool = pool;
        this.prisma = prisma;
        this.logger.log(`LiteLLM service ready (proxy=${config.baseUrl})`);
    }
    async getHealth() {
        const cached = await this.cache.getHealth();
        if (cached)
            return cached;
        const result = await this.client.getHealthFull();
        await this.cache.setHealth(result);
        return result;
    }
    async getLiveness() {
        return this.client.getHealthLiveness();
    }
    async getReadiness() {
        return this.client.getHealthReadiness();
    }
    async getVersion() {
        const cached = await this.cache.getVersion();
        if (cached)
            return cached;
        const result = await this.client.getVersion();
        await this.cache.setVersion(result);
        return result;
    }
    async getModels() {
        const cached = await this.cache.getModels();
        if (cached)
            return cached;
        const response = await this.client.getModels();
        await this.cache.setModels(response);
        return response;
    }
    async reload() {
        const result = await this.client.reload();
        await this.cache.invalidateAll();
        this.logger.log(`LiteLLM config reloaded, caches invalidated`);
        return result;
    }
    async sync(entityType = "ALL", triggeredBy = "manual") {
        const startedAt = new Date();
        const startMs = Date.now();
        let result;
        try {
            switch (entityType) {
                case "PROVIDERS":
                    await this.syncProviders(triggeredBy);
                    break;
                case "MODELS":
                    await this.syncModels(triggeredBy);
                    break;
                case "CAPABILITIES":
                    await this.syncCapabilities(triggeredBy);
                    break;
                case "METADATA":
                    await this.syncMetadata(triggeredBy);
                    break;
                case "VERSIONS":
                    await this.syncVersions(triggeredBy);
                    break;
                case "ALL":
                default:
                    await this.syncAll(triggeredBy);
                    break;
            }
            result = {
                entityType,
                status: "SUCCESS",
                startedAt: startedAt.toISOString(),
                completedAt: new Date().toISOString(),
                durationMs: Date.now() - startMs,
                itemsProcessed: 0,
                itemsCreated: 0,
                itemsUpdated: 0,
                itemsDeleted: 0,
                itemsFailed: 0,
            };
        }
        catch (err) {
            result = {
                entityType,
                status: "FAILED",
                startedAt: startedAt.toISOString(),
                completedAt: new Date().toISOString(),
                durationMs: Date.now() - startMs,
                itemsProcessed: 0,
                itemsCreated: 0,
                itemsUpdated: 0,
                itemsDeleted: 0,
                itemsFailed: 0,
                errorMessage: err.message,
            };
        }
        await this.repo.recordSync({
            entityType,
            status: result.status,
            startedAt,
            completedAt: new Date(),
            durationMs: result.durationMs,
            itemsProcessed: result.itemsProcessed,
            itemsCreated: result.itemsCreated,
            itemsUpdated: result.itemsUpdated,
            itemsDeleted: result.itemsDeleted,
            itemsFailed: result.itemsFailed,
            triggeredBy,
            errorMessage: result.errorMessage,
            details: { result },
        });
        await this.cache.invalidateModels();
        this.logger.log(`Sync ${entityType} ${result.status} in ${result.durationMs}ms`);
        return result;
    }
    async syncAll(triggeredBy) {
        this.logger.log(`[${triggeredBy}] Syncing ALL...`);
        await this.syncProviders(triggeredBy);
        await this.syncModels(triggeredBy);
        await this.syncCapabilities(triggeredBy);
        await this.syncMetadata(triggeredBy);
        await this.syncVersions(triggeredBy);
    }
    async syncProviders(_triggeredBy) {
        const response = await this.client.getModels();
        const { providers } = this.parser.parseModelList(response);
        for (const p of providers) {
            await this.repo.upsertProvider({
                litellmId: p.litellmId,
                name: p.name,
                slug: p.slug,
                type: p.type,
                baseUrl: p.baseUrl,
                supportedFeatures: p.supportedFeatures,
                status: p.status,
                metadata: p.metadata,
            });
        }
    }
    async syncModels(_triggeredBy) {
        const response = await this.client.getModels();
        const { providers, models } = this.parser.parseModelList(response);
        const providerIds = new Map();
        for (const p of providers) {
            const stored = await this.repo.findProviders({ slug: p.slug });
            if (stored[0])
                providerIds.set(p.name, stored[0].id);
        }
        for (const m of models) {
            const providerId = providerIds.get(m.providerName);
            if (!providerId) {
                this.logger.warn(`No provider ID for model ${m.modelName} (provider=${m.providerName})`);
                continue;
            }
            await this.repo.upsertModel({
                providerId,
                modelName: m.modelName,
                litellmModelId: m.litellmModelId,
                displayName: m.displayName,
                contextWindow: m.contextWindow,
                maxOutput: m.maxOutput,
                inputPricePer1k: m.inputPricePer1k,
                outputPricePer1k: m.outputPricePer1k,
                capabilities: m.capabilities,
                modalities: m.modalities,
                isActive: true,
                metadata: m.metadata,
            });
        }
    }
    async syncCapabilities(_triggeredBy) {
        await this.syncModels("capabilities-sub-sync");
    }
    async syncMetadata(_triggeredBy) {
        const response = await this.client.getModels();
        const { providers } = this.parser.parseModelList(response);
        for (const p of providers) {
            await this.repo.upsertProvider({
                litellmId: p.litellmId,
                name: p.name,
                slug: p.slug,
                type: p.type,
                baseUrl: p.baseUrl,
                supportedFeatures: p.supportedFeatures,
                status: p.status,
                metadata: p.metadata,
            });
        }
    }
    async syncVersions(_triggeredBy) {
        const version = await this.client.getVersion();
        await this.cache.setVersion(version);
    }
    async getMetrics() {
        const [providers, health] = await Promise.all([
            this.prisma.provider.count(),
            this.client.getHealthFull().catch(() => null),
        ]);
        const healthyEndpoints = health?.healthy_endpoints?.length ?? 0;
        const unhealthyEndpoints = health?.unhealthy_endpoints?.length ?? 0;
        const totalEndpoints = healthyEndpoints + unhealthyEndpoints;
        const totalModels = await this.prisma.modelCache.count({ where: { isActive: true } });
        const lastSync = await this.repo.findSyncHistory({}, 1);
        const circuits = this.breaker.getAll();
        const openCircuits = circuits.filter((c) => c.state === "OPEN").length;
        return {
            timestamp: new Date().toISOString(),
            totalProviders: providers,
            activeProviders: providers,
            totalModels,
            activeModels: totalModels,
            healthyProviders: healthyEndpoints,
            degradedProviders: 0,
            downProviders: unhealthyEndpoints,
            totalRequests: totalEndpoints,
            totalErrors: unhealthyEndpoints,
            avgLatencyMs: 0,
            cacheHitRate: 0,
            circuitBreakerOpen: openCircuits,
            lastSyncAt: lastSync[0] ? lastSync[0].startedAt.toISOString() : null,
        };
    }
    async getStatus() {
        const [version, models, providers, lastSync] = await Promise.all([
            this.client.getVersion().catch(() => null),
            this.prisma.modelCache.count(),
            this.prisma.provider.count(),
            this.repo.findSyncHistory({}, 1),
        ]);
        const circuits = this.breaker.getAll();
        const poolStats = this.pool.getStats();
        return {
            connected: !!version,
            proxyReachable: !!version,
            version: version?.version ?? null,
            lastSyncAt: lastSync[0] ? lastSync[0].startedAt.toISOString() : null,
            lastHealthCheckAt: new Date().toISOString(),
            providerCount: providers,
            modelCount: models,
            cacheStatus: {
                connected: true,
                keys: 0,
            },
            queueStatus: {
                waiting: 0,
                active: poolStats.active,
                failed: 0,
            },
            circuitBreakers: circuits.map((c) => ({
                providerId: c.key,
                providerName: c.key,
                state: c.state,
                failureCount: c.failureCount,
                lastFailureAt: c.lastFailureAt,
            })),
        };
    }
    async runScheduledHealthCheck() {
        this.logger.debug?.(`Scheduled health check running...`);
        try {
            const health = await this.client.getHealthFull();
            for (const endpoint of health.healthy_endpoints ?? []) {
                await this.repo.recordHealthCheck({
                    providerId: endpoint.model,
                    status: "HEALTHY",
                    checkType: "FULL",
                    latencyMs: 0,
                    details: { api_base: endpoint.api_base },
                    circuitState: "CLOSED",
                }).catch(() => void 0);
            }
            for (const endpoint of health.unhealthy_endpoints ?? []) {
                await this.repo.recordHealthCheck({
                    providerId: endpoint.model,
                    status: "DOWN",
                    checkType: "FULL",
                    latencyMs: 0,
                    errorMessage: endpoint.error,
                    details: { api_base: endpoint.api_base },
                    circuitState: this.breaker.isOpen(endpoint.model) ? "OPEN" : "CLOSED",
                }).catch(() => void 0);
            }
        }
        catch (err) {
            this.logger.warn(`Scheduled health check failed: ${err.message}`);
        }
    }
    async runScheduledSync() {
        this.logger.debug?.(`Scheduled sync running...`);
        try {
            await this.sync("ALL", "scheduler");
        }
        catch (err) {
            this.logger.error(`Scheduled sync failed: ${err.message}`);
        }
    }
    getConfig() {
        return this.config;
    }
    getCircuitBreakerStates() {
        return this.breaker.getAll();
    }
    getConnectionPoolStats() {
        return this.pool.getStats();
    }
    static unavailable(message) {
        return new common_1.ServiceUnavailableException(message);
    }
};
exports.LiteLLMService = LiteLLMService;
exports.LiteLLMService = LiteLLMService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("LITELLM_CONFIG")),
    __metadata("design:paramtypes", [Object, Function, litellm_parser_1.LiteLLMParser,
        litellm_cache_1.LiteLLMCache, Function, litellm_circuit_breaker_1.LiteLLMCircuitBreaker,
        litellm_connection_pool_1.LiteLLMConnectionPool,
        prisma_service_1.PrismaService])
], LiteLLMService);
//# sourceMappingURL=litellm.service.js.map