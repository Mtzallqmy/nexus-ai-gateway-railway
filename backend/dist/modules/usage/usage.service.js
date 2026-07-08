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
exports.UsageService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let UsageService = class UsageService {
    prisma;
    logger = new common_1.Logger("UsageService");
    constructor(prisma) {
        this.prisma = prisma;
        this.logger.log("Usage tracking service initialized");
    }
    async record(input) {
        const now = new Date();
        const periodStart = new Date(Math.floor(now.getTime() / 60000) * 60000);
        const periodEnd = new Date(periodStart.getTime() + 60000);
        const totalTokens = (input.inputTokens ?? 0) + (input.outputTokens ?? 0) + (input.cachedTokens ?? 0);
        await this.prisma.usageRecord.create({
            data: {
                organizationId: input.organizationId ?? null,
                userId: input.userId ?? null,
                apiKeyId: input.apiKeyId ?? null,
                providerName: input.providerName,
                modelName: input.modelName,
                endpoint: input.endpoint,
                method: input.method,
                requestCount: input.requestCount ?? 1,
                responseCount: input.responseCount ?? 0,
                inputTokens: input.inputTokens ?? 0,
                outputTokens: input.outputTokens ?? 0,
                cachedTokens: input.cachedTokens ?? 0,
                totalTokens,
                streamingSessions: input.streamingSessions ?? 0,
                imageCount: input.imageCount ?? 0,
                embeddingCount: input.embeddingCount ?? 0,
                speechCount: input.speechCount ?? 0,
                visionCount: input.visionCount ?? 0,
                moderationCount: input.moderationCount ?? 0,
                cost: new client_1.Prisma.Decimal(input.cost ?? 0),
                estimatedCost: new client_1.Prisma.Decimal(input.estimatedCost ?? input.cost ?? 0),
                realCost: new client_1.Prisma.Decimal(input.realCost ?? input.cost ?? 0),
                latencyMs: input.latencyMs ?? 0,
                errorCount: input.errorCount ?? 0,
                successCount: input.successCount ?? 0,
                periodStart,
                periodEnd,
                metadata: input.metadata ?? client_1.Prisma.JsonNull,
            },
        });
    }
    async getUsageSummary(organizationId, startDate, endDate) {
        const where = {};
        if (organizationId)
            where.organizationId = organizationId;
        if (startDate || endDate) {
            where.periodStart = {};
            if (startDate)
                where.periodStart.gte = startDate;
            if (endDate)
                where.periodStart.lte = endDate;
        }
        const aggregated = await this.prisma.usageRecord.aggregate({
            where,
            _sum: {
                requestCount: true,
                responseCount: true,
                inputTokens: true,
                outputTokens: true,
                cachedTokens: true,
                totalTokens: true,
                streamingSessions: true,
                imageCount: true,
                embeddingCount: true,
                speechCount: true,
                visionCount: true,
                moderationCount: true,
                cost: true,
                errorCount: true,
                successCount: true,
            },
            _count: { id: true },
        });
        return {
            records: aggregated._count.id,
            requests: aggregated._sum.requestCount ?? 0,
            responses: aggregated._sum.responseCount ?? 0,
            inputTokens: aggregated._sum.inputTokens ?? 0,
            outputTokens: aggregated._sum.outputTokens ?? 0,
            cachedTokens: aggregated._sum.cachedTokens ?? 0,
            totalTokens: aggregated._sum.totalTokens ?? 0,
            streamingSessions: aggregated._sum.streamingSessions ?? 0,
            images: aggregated._sum.imageCount ?? 0,
            embeddings: aggregated._sum.embeddingCount ?? 0,
            speech: aggregated._sum.speechCount ?? 0,
            vision: aggregated._sum.visionCount ?? 0,
            moderation: aggregated._sum.moderationCount ?? 0,
            cost: aggregated._sum.cost ?? new client_1.Prisma.Decimal(0),
            errors: aggregated._sum.errorCount ?? 0,
            successes: aggregated._sum.successCount ?? 0,
        };
    }
    async getUsageByType(organizationId, startDate, endDate) {
        const where = {};
        if (organizationId)
            where.organizationId = organizationId;
        if (startDate || endDate) {
            where.periodStart = {};
            if (startDate)
                where.periodStart.gte = startDate;
            if (endDate)
                where.periodStart.lte = endDate;
        }
        const aggregated = await this.prisma.usageRecord.aggregate({
            where,
            _sum: {
                streamingSessions: true,
                imageCount: true,
                embeddingCount: true,
                speechCount: true,
                visionCount: true,
                moderationCount: true,
            },
        });
        return {
            streaming: aggregated._sum.streamingSessions ?? 0,
            images: aggregated._sum.imageCount ?? 0,
            embeddings: aggregated._sum.embeddingCount ?? 0,
            speech: aggregated._sum.speechCount ?? 0,
            vision: aggregated._sum.visionCount ?? 0,
            moderation: aggregated._sum.moderationCount ?? 0,
        };
    }
};
exports.UsageService = UsageService;
exports.UsageService = UsageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsageService);
//# sourceMappingURL=usage.service.js.map