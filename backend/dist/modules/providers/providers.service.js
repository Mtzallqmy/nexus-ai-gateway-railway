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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvidersService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
const provider_catalog_1 = require("./registry/provider-catalog");
const litellm_constants_1 = require("../litellm/litellm.constants");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let ProvidersService = class ProvidersService {
    prisma;
    redis;
    config;
    litellmClient;
    logger = new common_1.Logger("ProvidersService");
    constructor(prisma, redis, config, litellmClient) {
        this.prisma = prisma;
        this.redis = redis;
        this.config = config;
        this.litellmClient = litellmClient;
        this.seedRegistry().catch((err) => this.logger.warn(`Registry seed failed: ${err.message}`));
    }
    async seedRegistry() {
        for (const entry of provider_catalog_1.PROVIDER_CATALOG) {
            await this.prisma.providerRegistryEntry.upsert({
                where: { slug: entry.slug },
                update: {
                    name: entry.name,
                    displayName: entry.displayName,
                    description: entry.description,
                    type: entry.type,
                    websiteUrl: entry.websiteUrl || null,
                    docsUrl: entry.docsUrl || null,
                    supportedFeatures: entry.supportedFeatures,
                    supportedCapabilities: entry.supportedCapabilities,
                    defaultModels: entry.defaultModels,
                    apiVersion: entry.apiVersion || null,
                    authType: entry.authType,
                    metadata: entry,
                },
                create: {
                    name: entry.name,
                    slug: entry.slug,
                    displayName: entry.displayName,
                    description: entry.description,
                    type: entry.type,
                    websiteUrl: entry.websiteUrl || null,
                    docsUrl: entry.docsUrl || null,
                    supportedFeatures: entry.supportedFeatures,
                    supportedCapabilities: entry.supportedCapabilities,
                    defaultModels: entry.defaultModels,
                    apiVersion: entry.apiVersion || null,
                    authType: entry.authType,
                    metadata: entry,
                },
            });
        }
        this.logger.log(`Provider registry seeded with ${provider_catalog_1.PROVIDER_CATALOG.length} providers`);
    }
    async findAll(query) {
        const where = {};
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: "insensitive" } },
                { displayName: { contains: query.search, mode: "insensitive" } },
                { description: { contains: query.search, mode: "insensitive" } },
            ];
        }
        if (query.type)
            where.type = query.type;
        if (query.enabled !== undefined)
            where.isEnabled = query.enabled;
        const [items, total] = await Promise.all([
            this.prisma.providerRegistryEntry.findMany({
                where,
                orderBy: { [query.sortBy]: query.sortOrder },
                skip: (query.page - 1) * query.pageSize,
                take: query.pageSize,
            }),
            this.prisma.providerRegistryEntry.count({ where }),
        ]);
        return (0, pagination_dto_1.buildPagination)(items, total, query);
    }
    async findBySlug(slug) {
        const entry = await this.prisma.providerRegistryEntry.findUnique({ where: { slug } });
        if (!entry)
            throw new common_1.NotFoundException(`Provider '${slug}' not found in registry`);
        return entry;
    }
    async getCatalog() {
        return provider_catalog_1.PROVIDER_CATALOG;
    }
    async validateApiKey(dto) {
        const startedAt = Date.now();
        const provider = (0, provider_catalog_1.getProviderBySlug)(dto.providerName) ?? provider_catalog_1.PROVIDER_CATALOG.find((p) => p.name === dto.providerName);
        if (!provider) {
            throw new common_1.NotFoundException(`Unknown provider: ${dto.providerName}`);
        }
        const apiKeyHash = crypto_1.default.createHash("sha256").update(dto.apiKey).digest("hex");
        const apiKeyMasked = `${dto.apiKey.slice(0, 4)}••••••••${dto.apiKey.slice(-4)}`;
        const modelToTest = dto.modelToTest ?? provider.defaultModels[0] ?? "gpt-3.5-turbo";
        const litellmModel = `${provider.litellmPrefix}${modelToTest}`;
        this.logger.log(`Validating API key for ${dto.providerName} (model=${litellmModel})`);
        const result = {
            providerName: dto.providerName,
            status: "UNKNOWN",
            isValid: false,
            latencyMs: 0,
            validatedModels: [],
            validatedAt: new Date().toISOString(),
        };
        try {
            await this.litellmClient.chatCompletion({
                model: litellmModel,
                messages: [{ role: "user", content: "Hi" }],
                max_tokens: 1,
                temperature: 0,
            });
            result.latencyMs = Date.now() - startedAt;
            result.status = "VALID";
            result.isValid = true;
            result.validatedModels = [modelToTest];
            this.logger.log(`API key validated for ${dto.providerName} (${result.latencyMs}ms)`);
        }
        catch (err) {
            result.latencyMs = Date.now() - startedAt;
            const httpErr = err;
            result.httpStatus = httpErr.status;
            result.errorMessage = httpErr.message;
            result.providerError = httpErr.code ?? httpErr.constructor.name;
            switch (httpErr.status) {
                case 401:
                    result.status = "INVALID";
                    result.providerMessage = "Invalid API key";
                    break;
                case 402:
                    result.status = "BILLING_REQUIRED";
                    result.providerMessage = "Payment required or billing limit reached";
                    break;
                case 403:
                    if (httpErr.message.toLowerCase().includes("region")) {
                        result.status = "REGION_BLOCKED";
                    }
                    else if (httpErr.message.toLowerCase().includes("organization")) {
                        result.status = "ORG_REQUIRED";
                    }
                    else {
                        result.status = "PERMISSION_DENIED";
                    }
                    result.providerMessage = httpErr.message;
                    break;
                case 404:
                    result.status = "UNSUPPORTED_ENDPOINT";
                    result.providerMessage = "Endpoint not found";
                    break;
                case 422:
                    if (httpErr.message.toLowerCase().includes("model")) {
                        result.status = "UNSUPPORTED_MODEL";
                    }
                    else {
                        result.status = "UNSUPPORTED_PARAMS";
                    }
                    result.providerMessage = httpErr.message;
                    break;
                case 429:
                    result.status = "RATE_LIMITED";
                    result.providerMessage = "Rate limit exceeded";
                    result.retryAfter = 60;
                    break;
                case 500:
                case 502:
                case 503:
                case 504:
                    result.status = "INTERNAL_ERROR";
                    result.providerMessage = "Provider internal error";
                    break;
                default:
                    if (httpErr.code === "ECONNRESET" || httpErr.code === "ETIMEDOUT" || httpErr.code === "ENOTFOUND" || httpErr.code === "ECONNREFUSED") {
                        result.status = "NETWORK_ERROR";
                    }
                    else if (httpErr.code === "ABORT_ERR" || httpErr.message?.includes("timeout")) {
                        result.status = "TIMEOUT";
                    }
                    else if (httpErr.message?.toLowerCase().includes("quota")) {
                        result.status = "QUOTA_EXCEEDED";
                    }
                    else if (httpErr.message?.toLowerCase().includes("disabled")) {
                        result.status = "DISABLED";
                    }
                    else if (httpErr.message?.toLowerCase().includes("expired")) {
                        result.status = "EXPIRED";
                    }
                    else {
                        result.status = "UNKNOWN";
                    }
                    result.providerMessage = httpErr.message;
            }
            this.logger.warn(`API key validation failed for ${dto.providerName}: status=${result.status} http=${httpErr.status}`);
        }
        await this.prisma.apiKeyValidation.create({
            data: {
                providerName: dto.providerName,
                apiKeyMasked,
                apiKeyHash,
                status: result.status,
                httpStatus: result.httpStatus ?? null,
                providerError: result.providerError ?? null,
                providerCode: result.providerCode ?? null,
                providerMessage: result.providerMessage ?? null,
                requestId: result.requestId ?? null,
                retryAfter: result.retryAfter ?? null,
                latencyMs: result.latencyMs,
                validatedModels: result.validatedModels,
                detectedQuota: result.detectedQuota ?? client_1.Prisma.JsonNull,
                detectedRateLimit: result.detectedRateLimit ?? client_1.Prisma.JsonNull,
                isValid: result.isValid,
                errorMessage: result.errorMessage ?? null,
            },
        });
        return result;
    }
    async getValidationHistory(providerName, limit = 20) {
        const where = providerName ? { providerName } : {};
        return this.prisma.apiKeyValidation.findMany({
            where,
            orderBy: { validatedAt: "desc" },
            take: limit,
        });
    }
    async discoverProvider(dto) {
        const provider = (0, provider_catalog_1.getProviderBySlug)(dto.providerName) ?? provider_catalog_1.PROVIDER_CATALOG.find((p) => p.name === dto.providerName);
        if (!provider) {
            throw new common_1.NotFoundException(`Unknown provider: ${dto.providerName}`);
        }
        this.logger.log(`Discovering provider: ${dto.providerName} (deep=${dto.deep})`);
        const result = {
            providerName: dto.providerName,
            status: "IN_PROGRESS",
            availableModels: [],
            capabilities: {},
            detectedFeatures: provider.supportedFeatures,
            visionSupport: provider.capabilities.vision,
            imageSupport: provider.capabilities.image,
            audioSupport: provider.capabilities.audio,
            speechSupport: provider.capabilities.speech,
            embeddingsSupport: provider.capabilities.embeddings,
            moderationSupport: provider.capabilities.moderation,
            functionCallingSupport: provider.capabilities.functionCalling,
            streamingSupport: provider.capabilities.streaming,
            jsonModeSupport: provider.capabilities.jsonMode,
            thinkingSupport: provider.capabilities.thinking,
            reasoningSupport: provider.capabilities.reasoning,
            toolCallingSupport: provider.capabilities.toolCalling,
            structuredOutputSupport: provider.capabilities.structuredOutput,
        };
        try {
            const modelsResponse = await this.litellmClient.getModels();
            const providerModels = (modelsResponse.data ?? []).filter((m) => {
                const litellmModel = m.litellm_params?.model ?? m.id;
                return litellmModel?.startsWith(provider.litellmPrefix);
            });
            result.availableModels = providerModels.map((m) => m.id);
            if (dto.deep && providerModels.length > 0) {
                const testModel = `${provider.litellmPrefix}${providerModels[0]?.id ?? provider.defaultModels[0]}`;
                try {
                    const stream = this.litellmClient.chatCompletionStream({
                        model: testModel,
                        messages: [{ role: "user", content: "Hi" }],
                        max_tokens: 1,
                    });
                    for await (const _chunk of stream) {
                        void _chunk;
                        break;
                    }
                    result.streamingSupport = true;
                }
                catch {
                    result.streamingSupport = false;
                }
                try {
                    await this.litellmClient.chatCompletion({
                        model: testModel,
                        messages: [{ role: "user", content: "Return {\"ok\": true}" }],
                        max_tokens: 10,
                        metadata: { response_format: { type: "json_object" } },
                    });
                    result.jsonModeSupport = true;
                }
                catch {
                    result.jsonModeSupport = false;
                }
                try {
                    await this.litellmClient.chatCompletion({
                        model: testModel,
                        messages: [{ role: "user", content: "What's the weather?" }],
                        max_tokens: 10,
                        metadata: { tools: [{ type: "function", function: { name: "get_weather", parameters: { type: "object", properties: {} } } }] },
                    });
                    result.functionCallingSupport = true;
                    result.toolCallingSupport = true;
                }
                catch {
                    result.functionCallingSupport = false;
                    result.toolCallingSupport = false;
                }
                if (provider.capabilities.embeddings) {
                    try {
                        await this.litellmClient.embeddings(testModel, "test");
                        result.embeddingsSupport = true;
                    }
                    catch {
                        result.embeddingsSupport = false;
                    }
                }
            }
            result.status = "COMPLETED";
            result.discoveredAt = new Date().toISOString();
            result.apiVersion = provider.apiVersion;
            result.capabilities = {
                vision: result.visionSupport,
                image: result.imageSupport,
                audio: result.audioSupport,
                speech: result.speechSupport,
                embeddings: result.embeddingsSupport,
                moderation: result.moderationSupport,
                functionCalling: result.functionCallingSupport,
                streaming: result.streamingSupport,
                jsonMode: result.jsonModeSupport,
                thinking: result.thinkingSupport,
                reasoning: result.reasoningSupport,
                toolCalling: result.toolCallingSupport,
                structuredOutput: result.structuredOutputSupport,
            };
            this.logger.log(`Discovery completed for ${dto.providerName}: ${result.availableModels.length} models found`);
        }
        catch (err) {
            result.status = "FAILED";
            result.errorMessage = err.message;
            this.logger.error(`Discovery failed for ${dto.providerName}: ${result.errorMessage}`);
        }
        await this.prisma.providerDiscoveryResult.upsert({
            where: { providerName: dto.providerName },
            update: {
                status: result.status,
                apiVersion: result.apiVersion ?? null,
                availableModels: result.availableModels,
                capabilities: result.capabilities,
                detectedFeatures: result.detectedFeatures,
                visionSupport: result.visionSupport,
                imageSupport: result.imageSupport,
                audioSupport: result.audioSupport,
                speechSupport: result.speechSupport,
                embeddingsSupport: result.embeddingsSupport,
                moderationSupport: result.moderationSupport,
                functionCallingSupport: result.functionCallingSupport,
                streamingSupport: result.streamingSupport,
                jsonModeSupport: result.jsonModeSupport,
                thinkingSupport: result.thinkingSupport,
                reasoningSupport: result.reasoningSupport,
                toolCallingSupport: result.toolCallingSupport,
                structuredOutputSupport: result.structuredOutputSupport,
                errorMessage: result.errorMessage ?? null,
                discoveredAt: result.discoveredAt ? new Date(result.discoveredAt) : null,
            },
            create: {
                providerName: dto.providerName,
                status: result.status,
                apiVersion: result.apiVersion ?? null,
                availableModels: result.availableModels,
                capabilities: result.capabilities,
                detectedFeatures: result.detectedFeatures,
                visionSupport: result.visionSupport,
                imageSupport: result.imageSupport,
                audioSupport: result.audioSupport,
                speechSupport: result.speechSupport,
                embeddingsSupport: result.embeddingsSupport,
                moderationSupport: result.moderationSupport,
                functionCallingSupport: result.functionCallingSupport,
                streamingSupport: result.streamingSupport,
                jsonModeSupport: result.jsonModeSupport,
                thinkingSupport: result.thinkingSupport,
                reasoningSupport: result.reasoningSupport,
                toolCallingSupport: result.toolCallingSupport,
                structuredOutputSupport: result.structuredOutputSupport,
                errorMessage: result.errorMessage ?? null,
                discoveredAt: result.discoveredAt ? new Date(result.discoveredAt) : null,
            },
        });
        return result;
    }
    async getDiscoveryResult(providerName) {
        return this.prisma.providerDiscoveryResult.findUnique({ where: { providerName } });
    }
    async getAllDiscoveryResults() {
        return this.prisma.providerDiscoveryResult.findMany({ orderBy: { updatedAt: "desc" } });
    }
    async getProviderHealth(providerName) {
        if (providerName) {
            const provider = await this.prisma.provider.findFirst({ where: { slug: providerName } });
            if (!provider)
                return [];
            return this.prisma.providerHealth.findMany({
                where: { providerId: provider.id },
                orderBy: { checkedAt: "desc" },
                take: 100,
            });
        }
        return this.prisma.providerHealth.findMany({
            orderBy: { checkedAt: "desc" },
            take: 100,
        });
    }
    async runHealthCheck(providerName) {
        const health = await this.litellmClient.getHealthFull();
        let checked = 0;
        let healthy = 0;
        let unhealthy = 0;
        for (const endpoint of health.healthy_endpoints ?? []) {
            if (providerName && !endpoint.model.includes(providerName))
                continue;
            checked++;
            healthy++;
        }
        for (const endpoint of health.unhealthy_endpoints ?? []) {
            if (providerName && !endpoint.model.includes(providerName))
                continue;
            checked++;
            unhealthy++;
        }
        return { checked, healthy, unhealthy };
    }
    async getStatistics(providerName) {
        const where = providerName ? { providerName } : {};
        const [totalRequests, totalErrors, totalTokens, totalCost] = await Promise.all([
            this.prisma.providerLog.count({ where }),
            this.prisma.providerLog.count({ where: { ...where, requestStatus: { gte: 400 } } }),
            this.prisma.providerLog.aggregate({ where, _sum: { tokenCount: true } }),
            this.prisma.providerLog.aggregate({ where, _sum: { cost: true } }),
        ]);
        const avgLatency = await this.prisma.providerLog.aggregate({
            where,
            _avg: { durationMs: true },
        });
        return {
            totalRequests,
            totalErrors,
            totalTokens: totalTokens._sum.tokenCount ?? 0,
            totalCost: totalCost._sum.cost ?? new client_1.Prisma.Decimal(0),
            avgLatencyMs: Math.round(avgLatency._avg.durationMs ?? 0),
            errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
            successRate: totalRequests > 0 ? ((totalRequests - totalErrors) / totalRequests) * 100 : 0,
        };
    }
    async getAnalytics(query) {
        const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const endDate = query.endDate ? new Date(query.endDate) : new Date();
        const where = {
            createdAt: { gte: startDate, lte: endDate },
        };
        if (query.providerName)
            where.providerName = query.providerName;
        const [logs, aggregated] = await Promise.all([
            this.prisma.providerLog.findMany({
                where,
                orderBy: { createdAt: "asc" },
                select: {
                    providerName: true,
                    modelName: true,
                    requestStatus: true,
                    durationMs: true,
                    tokenCount: true,
                    cost: true,
                    createdAt: true,
                    isStreaming: true,
                    isCached: true,
                },
            }),
            this.prisma.providerLog.groupBy({
                by: ["providerName"],
                where,
                _count: { id: true },
                _sum: { tokenCount: true, cost: true },
                _avg: { durationMs: true },
            }),
        ]);
        return {
            period: { start: startDate.toISOString(), end: endDate.toISOString() },
            granularity: query.granularity,
            totalRequests: logs.length,
            providers: aggregated.map((a) => ({
                providerName: a.providerName,
                requestCount: a._count.id,
                totalTokens: a._sum.tokenCount ?? 0,
                totalCost: a._sum.cost ?? new client_1.Prisma.Decimal(0),
                avgLatencyMs: Math.round(a._avg.durationMs ?? 0),
            })),
            timeline: this.buildTimeline(logs, query.granularity),
        };
    }
    buildTimeline(logs, granularity) {
        const buckets = new Map();
        for (const log of logs) {
            const key = this.bucketKey(log.createdAt, granularity);
            const bucket = buckets.get(key) ?? { requests: 0, errors: 0, tokens: 0, cost: 0, latencySum: 0 };
            bucket.requests++;
            if (log.requestStatus >= 400)
                bucket.errors++;
            bucket.tokens += log.tokenCount;
            bucket.cost += Number(log.cost);
            bucket.latencySum += log.durationMs;
            buckets.set(key, bucket);
        }
        return Array.from(buckets.entries()).map(([timestamp, data]) => ({
            timestamp,
            requests: data.requests,
            errors: data.errors,
            tokens: data.tokens,
            cost: data.cost,
            avgLatencyMs: data.requests > 0 ? Math.round(data.latencySum / data.requests) : 0,
        }));
    }
    bucketKey(date, granularity) {
        const d = new Date(date);
        switch (granularity) {
            case "hour":
                d.setMinutes(0, 0, 0);
                return d.toISOString();
            case "day":
                d.setHours(0, 0, 0, 0);
                return d.toISOString().slice(0, 10);
            case "week": {
                d.setHours(0, 0, 0, 0);
                const day = d.getDay();
                d.setDate(d.getDate() - day);
                return d.toISOString().slice(0, 10);
            }
            case "month":
                d.setDate(1);
                d.setHours(0, 0, 0, 0);
                return d.toISOString().slice(0, 7);
            default:
                return d.toISOString().slice(0, 10);
        }
    }
    async getLogs(query) {
        const where = {};
        if (query.providerName)
            where.providerName = query.providerName;
        if (query.modelName)
            where.modelName = query.modelName;
        if (query.status)
            where.requestStatus = query.status;
        if (query.startDate || query.endDate) {
            where.createdAt = {};
            if (query.startDate)
                where.createdAt.gte = new Date(query.startDate);
            if (query.endDate)
                where.createdAt.lte = new Date(query.endDate);
        }
        const [items, total] = await Promise.all([
            this.prisma.providerLog.findMany({
                where,
                orderBy: { [query.sortBy]: query.sortOrder },
                skip: (query.page - 1) * query.pageSize,
                take: query.pageSize,
            }),
            this.prisma.providerLog.count({ where }),
        ]);
        return (0, pagination_dto_1.buildPagination)(items, total, query);
    }
    async recordLog(data) {
        await this.prisma.providerLog.create({
            data: {
                providerName: data.providerName,
                modelName: data.modelName,
                endpoint: data.endpoint,
                method: data.method,
                requestStatus: data.requestStatus,
                durationMs: data.durationMs ?? 0,
                tokenCount: data.tokenCount ?? 0,
                inputTokens: data.inputTokens ?? 0,
                outputTokens: data.outputTokens ?? 0,
                cost: data.cost ?? new client_1.Prisma.Decimal(0),
                errorMessage: data.errorMessage,
                errorCode: data.errorCode,
                requestId: data.requestId,
                userId: data.userId,
                apiKeyId: data.apiKeyId,
                organizationId: data.organizationId,
                isStreaming: data.isStreaming ?? false,
                isCached: data.isCached ?? false,
                metadata: data.metadata ?? client_1.Prisma.JsonNull,
            },
        });
    }
    async getDashboard() {
        const [registry, health, stats, recentValidations, recentLogs] = await Promise.all([
            this.prisma.providerRegistryEntry.count(),
            this.litellmClient.getHealthFull().catch(() => ({ healthy_endpoints: [], unhealthy_endpoints: [] })),
            this.getStatistics(),
            this.getValidationHistory(undefined, 5),
            this.getLogs({ page: 1, pageSize: 10, sortBy: "createdAt", sortOrder: "desc" }),
        ]);
        return {
            timestamp: new Date().toISOString(),
            summary: {
                totalProviders: registry,
                healthyEndpoints: health.healthy_endpoints?.length ?? 0,
                unhealthyEndpoints: health.unhealthy_endpoints?.length ?? 0,
                ...stats,
            },
            recentValidations,
            recentLogs: recentLogs.data,
        };
    }
};
exports.ProvidersService = ProvidersService;
exports.ProvidersService = ProvidersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        config_1.ConfigService, Function])
], ProvidersService);
void litellm_constants_1.LITELLM_LOG_CONTEXTS;
void redis_service_1.RedisService;
//# sourceMappingURL=providers.service.js.map