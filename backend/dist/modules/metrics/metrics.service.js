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
var MetricsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
const queue_service_1 = require("../../infrastructure/queue/queue.service");
let MetricsService = MetricsService_1 = class MetricsService {
    prisma;
    redis;
    queue;
    logger = new common_1.Logger(MetricsService_1.name);
    startTime = Date.now();
    constructor(prisma, redis, queue) {
        this.prisma = prisma;
        this.redis = redis;
        this.queue = queue;
    }
    async collect() {
        const [users, organizations, projects, apiKeys, activeSessions, auditLogs] = await Promise.all([
            this.prisma.user.count({ where: { deletedAt: null } }),
            this.prisma.organization.count({ where: { deletedAt: null } }),
            this.prisma.project.count({ where: { deletedAt: null } }),
            this.prisma.apiKey.count({ where: { status: "ACTIVE" } }),
            this.prisma.session.count({ where: { status: "ACTIVE" } }),
            this.prisma.auditLog.count(),
        ]);
        const queueNames = this.queue.listQueues();
        const queueStats = await Promise.all(queueNames.map(async (name) => ({
            name,
            ...(await this.queue.getStats(name).catch(() => ({
                waiting: 0,
                active: 0,
                completed: 0,
                failed: 0,
                delayed: 0,
            }))),
        })));
        let redisInfo;
        let redisConnected = false;
        try {
            const raw = await this.redis.raw.info();
            redisConnected = true;
            redisInfo = this.parseRedisInfo(raw);
        }
        catch {
            redisConnected = false;
        }
        const mem = process.memoryUsage();
        return {
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            database: {
                users,
                organizations,
                projects,
                apiKeys,
                activeSessions,
                auditLogs,
            },
            cache: {
                connected: redisConnected,
                info: redisInfo,
            },
            queues: queueStats,
            memory: {
                rss: mem.rss,
                heapTotal: mem.heapTotal,
                heapUsed: mem.heapUsed,
                external: mem.external,
            },
        };
    }
    parseRedisInfo(raw) {
        const out = {};
        for (const line of raw.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#"))
                continue;
            const idx = trimmed.indexOf(":");
            if (idx < 0)
                continue;
            const key = trimmed.slice(0, idx);
            const value = trimmed.slice(idx + 1);
            out[key] = value;
        }
        return out;
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = MetricsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        queue_service_1.QueueService])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map