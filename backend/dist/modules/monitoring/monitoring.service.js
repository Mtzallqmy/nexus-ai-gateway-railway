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
exports.MonitoringService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
const os_1 = __importDefault(require("os"));
const perf_hooks_1 = require("perf_hooks");
let MonitoringService = class MonitoringService {
    prisma;
    redis;
    config;
    logger = new common_1.Logger("MonitoringService");
    startTime = Date.now();
    constructor(prisma, redis, config) {
        this.prisma = prisma;
        this.redis = redis;
        this.config = config;
        this.logger.log("Monitoring service initialized");
    }
    async getSystemMetrics() {
        const cpus = os_1.default.cpus();
        const totalMem = os_1.default.totalmem();
        const freeMem = os_1.default.freemem();
        const usedMem = totalMem - freeMem;
        const loadAvg = os_1.default.loadavg();
        const uptime = os_1.default.uptime();
        const cpuUsage = loadAvg[0] / cpus.length;
        return {
            hostname: os_1.default.hostname(),
            platform: os_1.default.platform(),
            arch: os_1.default.arch(),
            uptime,
            processUptime: Math.floor((Date.now() - this.startTime) / 1000),
            cpu: {
                cores: cpus.length,
                model: cpus[0]?.model ?? "unknown",
                speed: cpus[0]?.speed ?? 0,
                loadAvg1: loadAvg[0],
                loadAvg5: loadAvg[1],
                loadAvg15: loadAvg[2],
                usagePercent: Math.min(100, cpuUsage * 100),
            },
            memory: {
                total: totalMem,
                used: usedMem,
                free: freeMem,
                usagePercent: (usedMem / totalMem) * 100,
            },
            disk: await this.getDiskMetrics(),
            network: this.getNetworkMetrics(),
            process: {
                pid: process.pid,
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage(),
            },
        };
    }
    async getDiskMetrics() {
        return {
            total: 0,
            used: 0,
            free: 0,
            usagePercent: 0,
        };
    }
    getNetworkMetrics() {
        const interfaces = os_1.default.networkInterfaces();
        const result = {};
        for (const [name, addrs] of Object.entries(interfaces)) {
            if (addrs) {
                result[name] = addrs.map((a) => ({ address: a.address, family: a.family, internal: a.internal }));
            }
        }
        return { interfaces: result };
    }
    async getServiceHealth() {
        const [database, redis, litellm, nestjs] = await Promise.allSettled([
            this.checkPostgreSQL(),
            this.checkRedis(),
            this.checkLiteLLM(),
            this.checkNestJS(),
        ]);
        return {
            timestamp: new Date().toISOString(),
            services: {
                postgresql: this.formatResult(database),
                redis: this.formatResult(redis),
                litellm: this.formatResult(litellm),
                nestjs: this.formatResult(nestjs),
                nextjs: {
                    status: "healthy",
                    url: this.config.get("app.corsOrigins")?.split(",")[0] ?? "unknown",
                    message: "Frontend is served separately",
                },
            },
        };
    }
    async checkPostgreSQL() {
        const start = perf_hooks_1.performance.now();
        await this.prisma.$queryRaw `SELECT 1`;
        return { status: "healthy", latencyMs: Math.round(perf_hooks_1.performance.now() - start) };
    }
    async checkRedis() {
        const start = perf_hooks_1.performance.now();
        const pong = await this.redis.raw.ping();
        return { status: pong === "PONG" ? "healthy" : "degraded", latencyMs: Math.round(perf_hooks_1.performance.now() - start) };
    }
    async checkLiteLLM() {
        const litellmUrl = this.config.get("app.litellm.baseUrl") ?? "http://localhost:4000";
        try {
            const start = perf_hooks_1.performance.now();
            const response = await fetch(`${litellmUrl}/health/liveness`, {
                signal: AbortSignal.timeout(5000),
            });
            const latencyMs = Math.round(perf_hooks_1.performance.now() - start);
            if (response.ok) {
                return { status: "healthy", latencyMs, url: litellmUrl };
            }
            return { status: "degraded", latencyMs, url: litellmUrl, message: `HTTP ${response.status}` };
        }
        catch (err) {
            return { status: "down", url: litellmUrl, error: err.message };
        }
    }
    async checkNestJS() {
        return { status: "healthy", uptime: Math.floor((Date.now() - this.startTime) / 1000), memory: process.memoryUsage().rss };
    }
    formatResult(result) {
        if (result.status === "fulfilled")
            return result.value;
        return { status: "down", error: result.reason?.message };
    }
    async getHealthDashboard() {
        const [system, services, metrics] = await Promise.all([
            this.getSystemMetrics(),
            this.getServiceHealth(),
            this.getRecentMetrics(),
        ]);
        return {
            timestamp: new Date().toISOString(),
            system,
            services: services.services,
            recentMetrics: metrics,
        };
    }
    async getRecentMetrics(limit = 100) {
        return this.prisma.systemMetric.findMany({
            orderBy: { recordedAt: "desc" },
            take: limit,
        });
    }
    async recordMetric(name, value, unit, labels, source = "internal") {
        await this.prisma.systemMetric.create({
            data: {
                metricName: name,
                metricValue: value,
                metricUnit: unit,
                labels: labels ?? client_1.Prisma.JsonNull,
                source,
            },
        });
    }
    async getIntegrationStatus() {
        return {
            grafana: {
                enabled: !!process.env.GRAFANA_URL,
                url: process.env.GRAFANA_URL ?? null,
                apiKey: process.env.GRAFANA_API_KEY ? "configured" : null,
                dashboards: process.env.GRAFANA_DASHBOARD_IDS?.split(",") ?? [],
            },
            prometheus: {
                enabled: !!process.env.PROMETHEUS_URL,
                url: process.env.PROMETHEUS_URL ?? null,
                pushgateway: process.env.PROMETHEUS_PUSHGATEWAY_URL ?? null,
            },
            uptimeKuma: {
                enabled: !!process.env.UPTIME_KUMA_URL,
                url: process.env.UPTIME_KUMA_URL ?? null,
                pushToken: process.env.UPTIME_KUMA_PUSH_TOKEN ? "configured" : null,
            },
        };
    }
    async pushToPrometheus(metric, value, labels) {
        const pushUrl = process.env.PROMETHEUS_PUSHGATEWAY_URL;
        if (!pushUrl)
            return;
        this.logger.debug?.(`Pushing to Prometheus: ${metric}=${value} ${JSON.stringify(labels ?? {})}`);
    }
    async pushToUptimeKuma(status, message) {
        const url = process.env.UPTIME_KUMA_URL;
        const token = process.env.UPTIME_KUMA_PUSH_TOKEN;
        if (!url || !token)
            return;
        this.logger.debug?.(`Pushing to Uptime Kuma: ${status} ${message ?? ""}`);
    }
};
exports.MonitoringService = MonitoringService;
exports.MonitoringService = MonitoringService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        config_1.ConfigService])
], MonitoringService);
//# sourceMappingURL=monitoring.service.js.map