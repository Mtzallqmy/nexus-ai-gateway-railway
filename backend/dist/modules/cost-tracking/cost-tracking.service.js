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
exports.CostTrackingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let CostTrackingService = class CostTrackingService {
    prisma;
    logger = new common_1.Logger("CostTrackingService");
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCostByProvider(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.periodStart = {};
            if (startDate)
                where.periodStart.gte = startDate;
            if (endDate)
                where.periodStart.lte = endDate;
        }
        const grouped = await this.prisma.usageRecord.groupBy({
            by: ["providerName"],
            where,
            _sum: { cost: true, estimatedCost: true, realCost: true, requestCount: true, totalTokens: true },
        });
        return grouped.map((g) => ({
            provider: g.providerName,
            cost: Number(g._sum.cost ?? 0),
            estimatedCost: Number(g._sum.estimatedCost ?? 0),
            realCost: Number(g._sum.realCost ?? 0),
            requests: g._sum.requestCount ?? 0,
            tokens: g._sum.totalTokens ?? 0,
        }));
    }
    async getCostByUser(organizationId, startDate, endDate) {
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
        const grouped = await this.prisma.usageRecord.groupBy({
            by: ["userId"],
            where,
            _sum: { cost: true, estimatedCost: true, realCost: true, requestCount: true, totalTokens: true },
        });
        return grouped.map((g) => ({
            userId: g.userId,
            cost: Number(g._sum.cost ?? 0),
            estimatedCost: Number(g._sum.estimatedCost ?? 0),
            realCost: Number(g._sum.realCost ?? 0),
            requests: g._sum.requestCount ?? 0,
            tokens: g._sum.totalTokens ?? 0,
        }));
    }
    async getCostByOrganization(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.periodStart = {};
            if (startDate)
                where.periodStart.gte = startDate;
            if (endDate)
                where.periodStart.lte = endDate;
        }
        const grouped = await this.prisma.usageRecord.groupBy({
            by: ["organizationId"],
            where,
            _sum: { cost: true, estimatedCost: true, realCost: true, requestCount: true, totalTokens: true },
        });
        return grouped.map((g) => ({
            organizationId: g.organizationId,
            cost: Number(g._sum.cost ?? 0),
            estimatedCost: Number(g._sum.estimatedCost ?? 0),
            realCost: Number(g._sum.realCost ?? 0),
            requests: g._sum.requestCount ?? 0,
            tokens: g._sum.totalTokens ?? 0,
        }));
    }
    async getCostByModel(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.periodStart = {};
            if (startDate)
                where.periodStart.gte = startDate;
            if (endDate)
                where.periodStart.lte = endDate;
        }
        const grouped = await this.prisma.usageRecord.groupBy({
            by: ["modelName", "providerName"],
            where,
            _sum: { cost: true, estimatedCost: true, realCost: true, requestCount: true, totalTokens: true },
        });
        return grouped.map((g) => ({
            model: g.modelName,
            provider: g.providerName,
            cost: Number(g._sum.cost ?? 0),
            estimatedCost: Number(g._sum.estimatedCost ?? 0),
            realCost: Number(g._sum.realCost ?? 0),
            requests: g._sum.requestCount ?? 0,
            tokens: g._sum.totalTokens ?? 0,
        }));
    }
    async getDailyCost(organizationId, days = 30) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const where = {
            periodStart: { gte: startDate },
        };
        if (organizationId)
            where.organizationId = organizationId;
        const records = await this.prisma.usageRecord.findMany({
            where,
            orderBy: { periodStart: "asc" },
            select: { periodStart: true, cost: true, estimatedCost: true, realCost: true },
        });
        const buckets = new Map();
        for (const r of records) {
            const key = r.periodStart.toISOString().slice(0, 10);
            const existing = buckets.get(key) ?? { cost: 0, estimated: 0, real: 0 };
            existing.cost += Number(r.cost);
            existing.estimated += Number(r.estimatedCost);
            existing.real += Number(r.realCost);
            buckets.set(key, existing);
        }
        return Array.from(buckets.entries()).map(([date, data]) => ({ date, ...data }));
    }
    async getMonthlyCost(organizationId, months = 12) {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);
        const where = {
            periodStart: { gte: startDate },
        };
        if (organizationId)
            where.organizationId = organizationId;
        const records = await this.prisma.usageRecord.findMany({
            where,
            orderBy: { periodStart: "asc" },
            select: { periodStart: true, cost: true, estimatedCost: true, realCost: true },
        });
        const buckets = new Map();
        for (const r of records) {
            const key = r.periodStart.toISOString().slice(0, 7);
            const existing = buckets.get(key) ?? { cost: 0, estimated: 0, real: 0 };
            existing.cost += Number(r.cost);
            existing.estimated += Number(r.estimatedCost);
            existing.real += Number(r.realCost);
            buckets.set(key, existing);
        }
        return Array.from(buckets.entries()).map(([month, data]) => ({ month, ...data }));
    }
    async getTotalCost(organizationId) {
        const where = {};
        if (organizationId)
            where.organizationId = organizationId;
        const result = await this.prisma.usageRecord.aggregate({
            where,
            _sum: { cost: true, estimatedCost: true, realCost: true },
        });
        return {
            totalCost: Number(result._sum.cost ?? 0),
            totalEstimated: Number(result._sum.estimatedCost ?? 0),
            totalReal: Number(result._sum.realCost ?? 0),
        };
    }
};
exports.CostTrackingService = CostTrackingService;
exports.CostTrackingService = CostTrackingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CostTrackingService);
//# sourceMappingURL=cost-tracking.service.js.map