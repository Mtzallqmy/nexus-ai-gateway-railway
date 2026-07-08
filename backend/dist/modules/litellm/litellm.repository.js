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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiteLLMRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const litellm_constants_1 = require("./litellm.constants");
let LiteLLMRepository = class LiteLLMRepository {
    prisma;
    logger = new common_1.Logger(litellm_constants_1.LITELLM_LOG_CONTEXTS.REPOSITORY);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsertProvider(data) {
        const litellmId = data.litellmId;
        return this.prisma.provider.upsert({
            where: { litellmId },
            update: {
                name: data.name,
                type: data.type,
                description: data.description,
                baseUrl: data.baseUrl,
                status: data.status,
                supportedFeatures: data.supportedFeatures ?? [],
                region: data.region,
                lastSyncedAt: new Date(),
                metadata: data.metadata ?? client_1.Prisma.JsonNull,
            },
            create: {
                litellmId,
                name: data.name,
                slug: data.slug,
                type: data.type ?? "CUSTOM",
                description: data.description,
                baseUrl: data.baseUrl,
                status: data.status ?? "UNKNOWN",
                supportedFeatures: data.supportedFeatures ?? [],
                region: data.region,
                metadata: data.metadata ?? client_1.Prisma.JsonNull,
            },
        });
    }
    async findProviders(filter) {
        return this.prisma.provider.findMany({
            where: filter,
            orderBy: { name: "asc" },
        });
    }
    async findProviderById(id) {
        return this.prisma.provider.findUnique({ where: { id } });
    }
    async upsertModel(data) {
        const providerId = data.providerId;
        const modelName = data.modelName;
        return this.prisma.modelCache.upsert({
            where: { providerId_modelName: { providerId, modelName } },
            update: {
                litellmModelId: data.litellmModelId,
                displayName: data.displayName,
                description: data.description,
                contextWindow: data.contextWindow,
                maxOutput: data.maxOutput,
                inputPricePer1k: data.inputPricePer1k,
                outputPricePer1k: data.outputPricePer1k,
                capabilities: data.capabilities ?? [],
                modalities: data.modalities ?? [],
                isActive: data.isActive,
                metadata: data.metadata ?? client_1.Prisma.JsonNull,
                lastSyncedAt: new Date(),
            },
            create: {
                providerId,
                modelName,
                litellmModelId: data.litellmModelId,
                displayName: data.displayName,
                description: data.description,
                contextWindow: data.contextWindow,
                maxOutput: data.maxOutput,
                inputPricePer1k: data.inputPricePer1k,
                outputPricePer1k: data.outputPricePer1k,
                capabilities: data.capabilities ?? [],
                modalities: data.modalities ?? [],
                isActive: data.isActive ?? true,
                metadata: data.metadata ?? client_1.Prisma.JsonNull,
                lastSyncedAt: new Date(),
            },
        });
    }
    async findModels(filter) {
        return this.prisma.modelCache.findMany({
            where: filter,
            include: { provider: { select: { id: true, name: true, slug: true, type: true } } },
            orderBy: { modelName: "asc" },
        });
    }
    async deleteStaleModels(activeIds) {
        if (activeIds.length === 0) {
            const r = await this.prisma.modelCache.deleteMany({});
            return r.count;
        }
        const r = await this.prisma.modelCache.deleteMany({
            where: { id: { notIn: activeIds } },
        });
        return r.count;
    }
    async recordSync(data) {
        return this.prisma.synchronizationHistory.create({
            data: {
                entityType: data.entityType,
                status: data.status,
                startedAt: data.startedAt,
                completedAt: data.completedAt,
                durationMs: data.durationMs ?? 0,
                itemsProcessed: data.itemsProcessed ?? 0,
                itemsCreated: data.itemsCreated ?? 0,
                itemsUpdated: data.itemsUpdated ?? 0,
                itemsDeleted: data.itemsDeleted ?? 0,
                itemsFailed: data.itemsFailed ?? 0,
                triggeredBy: data.triggeredBy ?? "system",
                errorMessage: data.errorMessage,
                details: data.details ?? client_1.Prisma.JsonNull,
            },
        });
    }
    async findSyncHistory(filter, limit = 20) {
        return this.prisma.synchronizationHistory.findMany({
            where: filter,
            orderBy: { startedAt: "desc" },
            take: limit,
        });
    }
    async recordHealthCheck(data) {
        return this.prisma.providerHealth.create({
            data: {
                providerId: data.providerId,
                status: data.status,
                checkType: data.checkType ?? "FULL",
                latencyMs: data.latencyMs ?? 0,
                errorMessage: data.errorMessage,
                details: data.details ?? client_1.Prisma.JsonNull,
                circuitState: data.circuitState ?? "CLOSED",
            },
        });
    }
    async findLatestHealth(providerId) {
        return this.prisma.providerHealth.findFirst({
            where: { providerId },
            orderBy: { checkedAt: "desc" },
        });
    }
    async recordMetric(data) {
        return this.prisma.providerMetric.create({
            data: {
                providerId: data.providerId,
                metricName: data.metricName,
                metricValue: data.metricValue,
                metricUnit: data.metricUnit,
                labels: data.labels ?? client_1.Prisma.JsonNull,
            },
        });
    }
    async aggregateMetrics(providerId) {
        const where = providerId ? { providerId } : {};
        return this.prisma.providerMetric.groupBy({
            by: ["metricName"],
            where,
            _avg: { metricValue: true },
            _min: { metricValue: true },
            _max: { metricValue: true },
            _count: { metricValue: true },
        });
    }
    async incrementUsage(data) {
        const periodStart = new Date(Math.floor(Date.now() / 60_000) * 60_000);
        const periodEnd = new Date(periodStart.getTime() + 60_000);
        await this.prisma.usageCounter.upsert({
            where: {
                id: data.counterId,
            },
            update: {},
            create: {
                id: data.counterId,
                providerId: data.providerId,
                modelName: data.modelName,
                userId: data.userId,
                apiKeyId: data.apiKeyId,
                organizationId: data.organizationId,
                requestCount: data.requestCount ?? 0,
                tokenCount: data.tokenCount ?? 0,
                inputTokens: data.inputTokens ?? 0,
                outputTokens: data.outputTokens ?? 0,
                totalCost: data.totalCost ?? new client_1.Prisma.Decimal(0),
                errorCount: data.errorCount ?? 0,
                periodStart,
                periodEnd,
            },
        });
        this.logger.debug?.(`Usage incremented for ${data.modelName}`);
    }
};
exports.LiteLLMRepository = LiteLLMRepository;
exports.LiteLLMRepository = LiteLLMRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LiteLLMRepository);
//# sourceMappingURL=litellm.repository.js.map