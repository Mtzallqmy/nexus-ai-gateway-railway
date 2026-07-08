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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    logger = new common_1.Logger("AdminService");
    constructor(prisma) {
        this.prisma = prisma;
        this.seedDefaults().catch((err) => this.logger.warn(`Admin defaults seed failed: ${err.message}`));
    }
    async seedDefaults() {
        const defaults = [
            { category: "system", key: "system.name", value: "Moataz AI Gateway", type: "STRING", isPublic: true, description: "Platform name" },
            { category: "system", key: "system.maintenance_mode", value: false, type: "BOOLEAN", isPublic: true, description: "Maintenance mode flag" },
            { category: "system", key: "system.signup_enabled", value: true, type: "BOOLEAN", isPublic: true, description: "Allow new signups" },
            { category: "provider", key: "provider.default_timeout_ms", value: 30000, type: "NUMBER", description: "Default provider timeout" },
            { category: "provider", key: "provider.max_retries", value: 3, type: "NUMBER", description: "Max retries per provider" },
            { category: "billing", key: "billing.currency", value: "USD", type: "STRING", isPublic: true, description: "Default currency" },
            { category: "billing", key: "billing.trial_days", value: 14, type: "NUMBER", isPublic: true, description: "Default trial period" },
            { category: "monitoring", key: "monitoring.health_check_interval_ms", value: 30000, type: "NUMBER", description: "Health check interval" },
            { category: "monitoring", key: "monitoring.metrics_retention_days", value: 90, type: "NUMBER", description: "Metrics retention" },
            { category: "notification", key: "notification.email_enabled", value: true, type: "BOOLEAN", description: "Email notifications enabled" },
            { category: "notification", key: "notification.push_enabled", value: true, type: "BOOLEAN", description: "Push notifications enabled" },
        ];
        for (const d of defaults) {
            await this.prisma.adminSetting.upsert({
                where: { key: d.key },
                update: {},
                create: {
                    category: d.category,
                    key: d.key,
                    value: d.value,
                    type: d.type,
                    description: d.description,
                    isPublic: d.isPublic ?? false,
                },
            });
        }
    }
    async getSettings(category, publicOnly = false) {
        const where = {};
        if (category)
            where.category = category;
        if (publicOnly)
            where.isPublic = true;
        return this.prisma.adminSetting.findMany({
            where,
            orderBy: [{ category: "asc" }, { key: "asc" }],
        });
    }
    async getSetting(key) {
        const setting = await this.prisma.adminSetting.findUnique({ where: { key } });
        if (!setting)
            throw new common_1.NotFoundException(`Setting '${key}' not found`);
        return setting;
    }
    async getSettingValue(key, defaultValue) {
        const setting = await this.prisma.adminSetting.findUnique({ where: { key } });
        if (!setting)
            return defaultValue;
        return setting.value;
    }
    async setSetting(key, value, updatedBy) {
        const existing = await this.prisma.adminSetting.findUnique({ where: { key } });
        if (existing?.isReadOnly) {
            throw new Error(`Setting '${key}' is read-only`);
        }
        await this.prisma.adminSetting.upsert({
            where: { key },
            update: { value: value, updatedById: updatedBy },
            create: {
                key,
                value: value,
                category: "system",
                type: "JSON",
                updatedById: updatedBy,
            },
        });
    }
    async deleteSetting(key) {
        const setting = await this.getSetting(key);
        if (setting.isReadOnly)
            throw new Error(`Setting '${key}' is read-only`);
        await this.prisma.adminSetting.delete({ where: { key } });
    }
    async getSystemOverview() {
        const [settings, users, orgs, subscriptions, alerts, reports] = await Promise.all([
            this.prisma.adminSetting.count(),
            this.prisma.user.count(),
            this.prisma.organization.count(),
            this.prisma.subscription.count({ where: { status: "ACTIVE" } }),
            this.prisma.alert.count({ where: { status: "ACTIVE" } }),
            this.prisma.report.count({ where: { status: "READY" } }),
        ]);
        return {
            timestamp: new Date().toISOString(),
            stats: { settings, users, orgs, activeSubscriptions: subscriptions, activeAlerts: alerts, readyReports: reports },
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map