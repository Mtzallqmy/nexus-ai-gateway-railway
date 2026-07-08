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
exports.AlertsService = exports.createAlertRuleSchema = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const zod_1 = require("zod");
exports.createAlertRuleSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional(),
    type: zod_1.z.string(),
    severity: zod_1.z.enum(["INFO", "WARNING", "ERROR", "CRITICAL"]).default("WARNING"),
    metric: zod_1.z.string(),
    condition: zod_1.z.enum(["gt", "lt", "gte", "lte", "eq", "neq"]),
    threshold: zod_1.z.number(),
    windowMinutes: zod_1.z.number().int().min(1).default(5),
    cooldownMinutes: zod_1.z.number().int().min(0).default(30),
    actions: zod_1.z.array(zod_1.z.record(zod_1.z.unknown())).default([]),
});
let AlertsService = class AlertsService {
    prisma;
    logger = new common_1.Logger("AlertsService");
    constructor(prisma) {
        this.prisma = prisma;
        this.logger.log("Alerts service initialized");
        this.seedDefaultRules().catch((err) => this.logger.warn(`Default rules seed failed: ${err.message}`));
    }
    async seedDefaultRules() {
        const defaults = [
            { name: "Provider Down", type: "provider_down", metric: "provider.status", condition: "eq", threshold: 0, severity: "CRITICAL", windowMinutes: 1, cooldownMinutes: 60 },
            { name: "Slow Provider", type: "slow_provider", metric: "provider.latency_ms", condition: "gt", threshold: 5000, severity: "WARNING", windowMinutes: 5, cooldownMinutes: 30 },
            { name: "High Latency", type: "high_latency", metric: "request.latency_p95", condition: "gt", threshold: 3000, severity: "WARNING", windowMinutes: 5, cooldownMinutes: 15 },
            { name: "Quota Exceeded", type: "quota_exceeded", metric: "usage.exceeded", condition: "eq", threshold: 1, severity: "ERROR", windowMinutes: 1, cooldownMinutes: 60 },
            { name: "Database Errors", type: "database_errors", metric: "db.error_count", condition: "gt", threshold: 10, severity: "CRITICAL", windowMinutes: 5, cooldownMinutes: 30 },
            { name: "Redis Errors", type: "redis_errors", metric: "redis.error_count", condition: "gt", threshold: 10, severity: "CRITICAL", windowMinutes: 5, cooldownMinutes: 30 },
            { name: "Sync Failure", type: "sync_failure", metric: "sync.failed", condition: "eq", threshold: 1, severity: "ERROR", windowMinutes: 10, cooldownMinutes: 30 },
            { name: "Unexpected Cost", type: "unexpected_cost", metric: "cost.daily_anomaly", condition: "gt", threshold: 100, severity: "WARNING", windowMinutes: 60, cooldownMinutes: 1440 },
        ];
        for (const rule of defaults) {
            await this.prisma.alertRule.upsert({
                where: { name: rule.name },
                update: {},
                create: { ...rule, actions: [] },
            });
        }
        this.logger.log(`Seeded ${defaults.length} default alert rules`);
    }
    async createRule(dto) {
        return this.prisma.alertRule.create({
            data: { ...dto, actions: dto.actions },
        });
    }
    async getRules(includeDisabled = false) {
        return this.prisma.alertRule.findMany({
            where: includeDisabled ? {} : { isEnabled: true },
            orderBy: { name: "asc" },
        });
    }
    async updateRule(id, dto) {
        return this.prisma.alertRule.update({ where: { id }, data: dto });
    }
    async deleteRule(id) {
        await this.prisma.alertRule.delete({ where: { id } });
        return { message: "Rule deleted" };
    }
    async getAlerts(status, severity, limit = 50) {
        const where = {};
        if (status)
            where.status = status;
        if (severity)
            where.severity = severity;
        return this.prisma.alert.findMany({
            where,
            orderBy: { triggeredAt: "desc" },
            take: limit,
        });
    }
    async acknowledgeAlert(id, userId) {
        await this.prisma.alert.update({
            where: { id },
            data: { status: "ACKNOWLEDGED", acknowledgedBy: userId, acknowledgedAt: new Date() },
        });
    }
    async resolveAlert(id, userId, reason) {
        await this.prisma.alert.update({
            where: { id },
            data: { status: "RESOLVED", resolvedBy: userId, resolvedAt: new Date(), resolvedReason: reason },
        });
    }
    async triggerAlert(data) {
        await this.prisma.alert.create({
            data: {
                name: data.name,
                type: data.type,
                severity: data.severity,
                status: "ACTIVE",
                message: data.message,
                resourceName: data.resourceName,
                resourceId: data.resourceId,
                currentValue: data.currentValue,
                threshold: data.threshold,
                source: data.source ?? "system",
                metadata: data.metadata ?? client_1.Prisma.JsonNull,
            },
        });
        this.logger.warn(`Alert triggered: ${data.name} [${data.severity}] — ${data.message}`);
    }
    async evaluateAlerts() {
        const rules = await this.prisma.alertRule.findMany({ where: { isEnabled: true } });
        let triggered = 0;
        for (const rule of rules) {
            if (rule.lastTriggeredAt) {
                const cooldownEnd = new Date(rule.lastTriggeredAt.getTime() + rule.cooldownMinutes * 60000);
                if (new Date() < cooldownEnd)
                    continue;
            }
            const shouldTrigger = await this.evaluateRule(rule);
            if (shouldTrigger) {
                await this.triggerAlert({
                    name: rule.name,
                    type: rule.type,
                    severity: rule.severity,
                    message: `${rule.name}: ${rule.metric} ${rule.condition} ${rule.threshold}`,
                    currentValue: "N/A",
                    threshold: String(rule.threshold),
                });
                await this.prisma.alertRule.update({
                    where: { id: rule.id },
                    data: { lastTriggeredAt: new Date(), triggerCount: { increment: 1 } },
                });
                triggered++;
            }
        }
        return { evaluated: rules.length, triggered };
    }
    async evaluateRule(rule) {
        void rule;
        return false;
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map