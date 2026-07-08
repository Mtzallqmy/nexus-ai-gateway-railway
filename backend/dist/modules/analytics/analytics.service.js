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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    logger = new common_1.Logger("AnalyticsService");
    constructor(prisma) {
        this.prisma = prisma;
        this.logger.log("Analytics service initialized");
    }
    async getUsageAnalytics(query) {
        const where = this.buildWhere(query);
        const records = await this.prisma.usageRecord.findMany({
            where,
            orderBy: { periodStart: "asc" },
            select: {
                periodStart: true,
                requestCount: true,
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
            },
        });
        const summary = {
            totalRequests: records.reduce((s, r) => s + r.requestCount, 0),
            totalInputTokens: records.reduce((s, r) => s + r.inputTokens, 0),
            totalOutputTokens: records.reduce((s, r) => s + r.outputTokens, 0),
            totalCachedTokens: records.reduce((s, r) => s + r.cachedTokens, 0),
            totalTokens: records.reduce((s, r) => s + r.totalTokens, 0),
            totalStreamingSessions: records.reduce((s, r) => s + r.streamingSessions, 0),
            totalImages: records.reduce((s, r) => s + r.imageCount, 0),
            totalEmbeddings: records.reduce((s, r) => s + r.embeddingCount, 0),
            totalSpeech: records.reduce((s, r) => s + r.speechCount, 0),
            totalVision: records.reduce((s, r) => s + r.visionCount, 0),
            totalModeration: records.reduce((s, r) => s + r.moderationCount, 0),
            totalCost: this.sumDecimal(records.map((r) => r.cost)),
        };
        return {
            summary,
            timeline: this.buildTimeline(records, query.granularity ?? "day", (r) => ({
                requests: r.requestCount,
                tokens: r.totalTokens,
                cost: Number(r.cost),
            })),
        };
    }
    async getRequestAnalytics(query) {
        const where = this.buildWhere(query);
        const [byProvider, byModel, byEndpoint, byMethod] = await Promise.all([
            this.prisma.usageRecord.groupBy({ by: ["providerName"], where, _count: { requestCount: true }, _sum: { requestCount: true, errorCount: true } }),
            this.prisma.usageRecord.groupBy({ by: ["modelName"], where, _count: { requestCount: true }, _sum: { requestCount: true, errorCount: true } }),
            this.prisma.usageRecord.groupBy({ by: ["endpoint"], where, _count: { requestCount: true }, _sum: { requestCount: true } }),
            this.prisma.usageRecord.groupBy({ by: ["method"], where, _count: { requestCount: true }, _sum: { requestCount: true } }),
        ]);
        return {
            byProvider: byProvider.map((p) => ({ provider: p.providerName, requests: p._sum.requestCount ?? 0, errors: p._sum.errorCount ?? 0 })),
            byModel: byModel.map((m) => ({ model: m.modelName, requests: m._sum.requestCount ?? 0, errors: m._sum.errorCount ?? 0 })),
            byEndpoint: byEndpoint.map((e) => ({ endpoint: e.endpoint, requests: e._sum.requestCount ?? 0 })),
            byMethod: byMethod.map((m) => ({ method: m.method, requests: m._sum.requestCount ?? 0 })),
        };
    }
    async getProviderAnalytics(query) {
        const where = this.buildWhere(query);
        const grouped = await this.prisma.usageRecord.groupBy({
            by: ["providerName"],
            where,
            _count: { id: true },
            _sum: {
                requestCount: true,
                inputTokens: true,
                outputTokens: true,
                totalTokens: true,
                cost: true,
                errorCount: true,
                successCount: true,
                latencyMs: true,
            },
        });
        return grouped.map((g) => {
            const requests = g._sum.requestCount ?? 0;
            const errors = g._sum.errorCount ?? 0;
            const successes = g._sum.successCount ?? 0;
            return {
                provider: g.providerName,
                requests,
                tokens: g._sum.totalTokens ?? 0,
                cost: Number(g._sum.cost ?? 0),
                errors,
                successes,
                errorRate: requests > 0 ? (errors / requests) * 100 : 0,
                successRate: requests > 0 ? (successes / requests) * 100 : 0,
                avgLatencyMs: requests > 0 ? Math.round((g._sum.latencyMs ?? 0) / requests) : 0,
            };
        });
    }
    async getModelAnalytics(query) {
        const where = this.buildWhere(query);
        const grouped = await this.prisma.usageRecord.groupBy({
            by: ["modelName", "providerName"],
            where,
            _count: { id: true },
            _sum: {
                requestCount: true,
                totalTokens: true,
                cost: true,
                errorCount: true,
                latencyMs: true,
            },
        });
        return grouped.map((g) => {
            const requests = g._sum.requestCount ?? 0;
            return {
                model: g.modelName,
                provider: g.providerName,
                requests,
                tokens: g._sum.totalTokens ?? 0,
                cost: Number(g._sum.cost ?? 0),
                errors: g._sum.errorCount ?? 0,
                avgLatencyMs: requests > 0 ? Math.round((g._sum.latencyMs ?? 0) / requests) : 0,
                avgCostPerRequest: requests > 0 ? Number(g._sum.cost ?? 0) / requests : 0,
                avgTokensPerRequest: requests > 0 ? (g._sum.totalTokens ?? 0) / requests : 0,
            };
        }).sort((a, b) => b.requests - a.requests);
    }
    async getCostAnalytics(query) {
        const where = this.buildWhere(query);
        const records = await this.prisma.usageRecord.findMany({
            where,
            orderBy: { periodStart: "asc" },
            select: { periodStart: true, cost: true, estimatedCost: true, realCost: true, providerName: true, modelName: true },
        });
        const byProvider = this.groupBy(records, "providerName", (r) => Number(r.cost));
        const byModel = this.groupBy(records, "modelName", (r) => Number(r.cost));
        return {
            summary: {
                totalCost: this.sumDecimal(records.map((r) => r.cost)),
                totalEstimated: this.sumDecimal(records.map((r) => r.estimatedCost)),
                totalReal: this.sumDecimal(records.map((r) => r.realCost)),
            },
            byProvider,
            byModel,
            timeline: this.buildTimeline(records, query.granularity ?? "day", (r) => ({
                cost: Number(r.cost),
                estimated: Number(r.estimatedCost),
                real: Number(r.realCost),
            })),
        };
    }
    async getLatencyAnalytics(query) {
        const where = this.buildWhere(query);
        const records = await this.prisma.usageRecord.findMany({
            where,
            orderBy: { periodStart: "asc" },
            select: { periodStart: true, latencyMs: true, providerName: true, modelName: true },
        });
        const latencies = records.map((r) => r.latencyMs).filter((l) => l > 0).sort((a, b) => a - b);
        const byProvider = this.groupBy(records, "providerName", (r) => r.latencyMs);
        return {
            summary: {
                avg: latencies.length > 0 ? Math.round(latencies.reduce((s, l) => s + l, 0) / latencies.length) : 0,
                p50: this.percentile(latencies, 50),
                p95: this.percentile(latencies, 95),
                p99: this.percentile(latencies, 99),
                min: latencies[0] ?? 0,
                max: latencies[latencies.length - 1] ?? 0,
            },
            byProvider: Object.entries(byProvider).map(([provider, values]) => ({
                provider,
                avg: values.length > 0 ? Math.round(values.reduce((s, v) => s + v, 0) / values.length) : 0,
                p50: this.percentile(values.sort((a, b) => a - b), 50),
                p95: this.percentile(values.sort((a, b) => a - b), 95),
            })),
            timeline: this.buildTimeline(records, query.granularity ?? "day", (r) => ({ latency: r.latencyMs })),
        };
    }
    async getErrorAnalytics(query) {
        const where = this.buildWhere(query);
        const records = await this.prisma.usageRecord.findMany({
            where: { ...where, errorCount: { gt: 0 } },
            orderBy: { periodStart: "asc" },
            select: { periodStart: true, errorCount: true, successCount: true, requestCount: true, providerName: true, modelName: true },
        });
        const totalErrors = records.reduce((s, r) => s + r.errorCount, 0);
        const totalRequests = records.reduce((s, r) => s + r.requestCount, 0);
        const totalSuccesses = records.reduce((s, r) => s + r.successCount, 0);
        return {
            summary: {
                totalErrors,
                totalRequests,
                totalSuccesses,
                errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
                successRate: totalRequests > 0 ? (totalSuccesses / totalRequests) * 100 : 0,
                failureRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
            },
            byProvider: this.groupBy(records, "providerName", (r) => r.errorCount),
            timeline: this.buildTimeline(records, query.granularity ?? "day", (r) => ({
                errors: r.errorCount,
                successes: r.successCount,
                requests: r.requestCount,
            })),
        };
    }
    async getUserAnalytics(query) {
        const where = this.buildWhere(query);
        const grouped = await this.prisma.usageRecord.groupBy({
            by: ["userId"],
            where,
            _count: { id: true },
            _sum: { requestCount: true, totalTokens: true, cost: true, errorCount: true },
        });
        return grouped.map((g) => ({
            userId: g.userId,
            requests: g._sum.requestCount ?? 0,
            tokens: g._sum.totalTokens ?? 0,
            cost: Number(g._sum.cost ?? 0),
            errors: g._sum.errorCount ?? 0,
        })).sort((a, b) => b.cost - a.cost);
    }
    async getOrganizationAnalytics(query) {
        const where = this.buildWhere(query);
        const grouped = await this.prisma.usageRecord.groupBy({
            by: ["organizationId"],
            where,
            _count: { id: true },
            _sum: { requestCount: true, totalTokens: true, cost: true, errorCount: true },
        });
        return grouped.map((g) => ({
            organizationId: g.organizationId,
            requests: g._sum.requestCount ?? 0,
            tokens: g._sum.totalTokens ?? 0,
            cost: Number(g._sum.cost ?? 0),
            errors: g._sum.errorCount ?? 0,
        })).sort((a, b) => b.cost - a.cost);
    }
    async getApiAnalytics(query) {
        const where = this.buildWhere(query);
        const grouped = await this.prisma.usageRecord.groupBy({
            by: ["apiKeyId"],
            where,
            _count: { id: true },
            _sum: { requestCount: true, totalTokens: true, cost: true, errorCount: true },
        });
        return grouped.map((g) => ({
            apiKeyId: g.apiKeyId,
            requests: g._sum.requestCount ?? 0,
            tokens: g._sum.totalTokens ?? 0,
            cost: Number(g._sum.cost ?? 0),
            errors: g._sum.errorCount ?? 0,
        })).sort((a, b) => b.requests - a.requests);
    }
    async getExecutiveDashboard() {
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const [last24hStats, last7dStats, last30dStats, topProviders, topModels, recentAlerts, activeSubscriptions, totalRevenue] = await Promise.all([
            this.getSummary(last24h),
            this.getSummary(last7d),
            this.getSummary(last30d),
            this.getProviderAnalytics({ startDate: last7d.toISOString() }),
            this.getModelAnalytics({ startDate: last7d.toISOString() }),
            this.prisma.alert.findMany({ where: { status: { in: ["ACTIVE", "ACKNOWLEDGED"] } }, orderBy: { triggeredAt: "desc" }, take: 10 }),
            this.prisma.subscription.count({ where: { status: "ACTIVE" } }),
            this.prisma.payment.aggregate({ where: { status: "SUCCEEDED" }, _sum: { amount: true } }),
        ]);
        return {
            timestamp: now.toISOString(),
            periods: {
                last24h: last24hStats,
                last7d: last7dStats,
                last30d: last30dStats,
            },
            topProviders: topProviders.slice(0, 5),
            topModels: topModels.slice(0, 10),
            recentAlerts,
            activeSubscriptions,
            totalRevenue: totalRevenue._sum.amount ?? new client_1.Prisma.Decimal(0),
        };
    }
    async getSummary(since) {
        const records = await this.prisma.usageRecord.findMany({
            where: { periodStart: { gte: since } },
            select: { requestCount: true, totalTokens: true, cost: true, errorCount: true, successCount: true, latencyMs: true },
        });
        const requests = records.reduce((s, r) => s + r.requestCount, 0);
        const errors = records.reduce((s, r) => s + r.errorCount, 0);
        const successes = records.reduce((s, r) => s + r.successCount, 0);
        return {
            requests,
            tokens: records.reduce((s, r) => s + r.totalTokens, 0),
            cost: this.sumDecimal(records.map((r) => r.cost)),
            errors,
            successes,
            errorRate: requests > 0 ? (errors / requests) * 100 : 0,
            successRate: requests > 0 ? (successes / requests) * 100 : 0,
            avgLatencyMs: requests > 0 ? Math.round(records.reduce((s, r) => s + r.latencyMs, 0) / requests) : 0,
        };
    }
    buildWhere(query) {
        const where = {};
        if (query.startDate || query.endDate) {
            where.periodStart = {};
            if (query.startDate)
                where.periodStart.gte = new Date(query.startDate);
            if (query.endDate)
                where.periodStart.lte = new Date(query.endDate);
        }
        if (query.providerName)
            where.providerName = query.providerName;
        if (query.modelName)
            where.modelName = query.modelName;
        if (query.organizationId)
            where.organizationId = query.organizationId;
        if (query.userId)
            where.userId = query.userId;
        return where;
    }
    buildTimeline(records, granularity, extractor) {
        const buckets = new Map();
        for (const r of records) {
            const key = this.bucketKey(r.periodStart, granularity);
            const existing = buckets.get(key) ?? {};
            const extracted = extractor(r);
            for (const [k, v] of Object.entries(extracted)) {
                existing[k] = (existing[k] ?? 0) + v;
            }
            buckets.set(key, existing);
        }
        return Array.from(buckets.entries())
            .map(([timestamp, data]) => ({ timestamp, ...data }))
            .sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
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
    groupBy(records, key, valueExtractor) {
        const out = {};
        for (const r of records) {
            const k = String(r[key] ?? "unknown");
            if (!out[k])
                out[k] = [];
            out[k].push(valueExtractor(r));
        }
        return out;
    }
    percentile(sorted, p) {
        if (sorted.length === 0)
            return 0;
        const idx = Math.ceil((p / 100) * sorted.length) - 1;
        return sorted[Math.max(0, idx)] ?? 0;
    }
    sumDecimal(values) {
        return values.reduce((sum, v) => sum.add(v ?? 0), new client_1.Prisma.Decimal(0));
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map