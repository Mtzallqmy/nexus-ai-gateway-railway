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
var HealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
const queue_service_1 = require("../../infrastructure/queue/queue.service");
let HealthService = HealthService_1 = class HealthService {
    prisma;
    redis;
    queue;
    config;
    logger = new common_1.Logger(HealthService_1.name);
    startTime = Date.now();
    constructor(prisma, redis, queue, config) {
        this.prisma = prisma;
        this.redis = redis;
        this.queue = queue;
        this.config = config;
    }
    async check() {
        const [db, cache, queue] = await Promise.allSettled([
            this.checkDatabase(),
            this.checkRedis(),
            this.checkQueue(),
        ]);
        const services = {};
        if (db.status === "fulfilled") {
            services.database = db.value;
        }
        else {
            services.database = { status: "down", error: db.reason?.message };
        }
        if (cache.status === "fulfilled") {
            services.redis = cache.value;
        }
        else {
            services.redis = { status: "down", error: cache.reason?.message };
        }
        if (queue.status === "fulfilled") {
            services.queue = queue.value;
        }
        else {
            services.queue = { status: "down", error: queue.reason?.message };
        }
        const anyDown = Object.values(services).some((s) => s.status === "down");
        const anyDegraded = Object.values(services).some((s) => s.status === "degraded");
        return {
            status: anyDown ? "down" : anyDegraded ? "degraded" : "healthy",
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            services,
        };
    }
    async checkDatabase() {
        const start = Date.now();
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            const latency = Date.now() - start;
            return {
                status: "healthy",
                latencyMs: latency,
                details: { provider: "postgresql" },
            };
        }
        catch (err) {
            return {
                status: "down",
                error: err.message,
            };
        }
    }
    async checkRedis() {
        const start = Date.now();
        try {
            const pong = await this.redis.raw.ping();
            return {
                status: pong === "PONG" ? "healthy" : "degraded",
                latencyMs: Date.now() - start,
                details: { prefix: this.config.get("app.redis.keyPrefix") },
            };
        }
        catch (err) {
            return { status: "down", error: err.message };
        }
    }
    async checkQueue() {
        try {
            const queues = this.queue.listQueues();
            return {
                status: "healthy",
                details: { queues: queues.length, names: queues },
            };
        }
        catch (err) {
            return { status: "down", error: err.message };
        }
    }
    async liveness() {
        return { status: "alive", timestamp: new Date().toISOString() };
    }
    async readiness() {
        return this.check();
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = HealthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        queue_service_1.QueueService,
        config_1.ConfigService])
], HealthService);
//# sourceMappingURL=health.service.js.map