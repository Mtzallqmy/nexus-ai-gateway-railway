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
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = RedisService_1 = class RedisService {
    config;
    logger = new common_1.Logger(RedisService_1.name);
    client;
    constructor(config) {
        this.config = config;
    }
    onModuleInit() {
        const host = this.config.get("app.redis.host") ?? "localhost";
        const port = this.config.get("app.redis.port") ?? 6379;
        const password = this.config.get("app.redis.password");
        const db = this.config.get("app.redis.db") ?? 0;
        const keyPrefix = this.config.get("app.redis.keyPrefix") ?? "moataz:";
        this.client = new ioredis_1.default({
            host,
            port,
            password: password || undefined,
            db,
            keyPrefix,
            retryStrategy: (times) => {
                if (times > 10) {
                    this.logger.error("Redis connection retries exhausted");
                    return null;
                }
                return Math.min(times * 200, 2000);
            },
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
        });
        this.client.on("connect", () => this.logger.log("✅ Redis connected"));
        this.client.on("error", (err) => this.logger.error(`Redis error: ${err.message}`));
        this.client.on("reconnecting", () => this.logger.warn("Redis reconnecting..."));
    }
    async onModuleDestroy() {
        if (this.client) {
            await this.client.quit();
            this.logger.log("Redis disconnected");
        }
    }
    get raw() {
        return this.client;
    }
    async get(key) {
        return this.client.get(key);
    }
    async set(key, value, ttlSeconds) {
        if (ttlSeconds) {
            await this.client.set(key, value, "EX", ttlSeconds);
        }
        else {
            await this.client.set(key, value);
        }
    }
    async del(...keys) {
        return this.client.del(...keys);
    }
    async exists(key) {
        const r = await this.client.exists(key);
        return r === 1;
    }
    async incr(key) {
        return this.client.incr(key);
    }
    async expire(key, ttlSeconds) {
        const r = await this.client.expire(key, ttlSeconds);
        return r === 1;
    }
    async ttl(key) {
        return this.client.ttl(key);
    }
    async hset(key, field, value) {
        return this.client.hset(key, field, value);
    }
    async hget(key, field) {
        return this.client.hget(key, field);
    }
    async hgetall(key) {
        return this.client.hgetall(key);
    }
    async sadd(key, ...members) {
        return this.client.sadd(key, ...members);
    }
    async srem(key, ...members) {
        return this.client.srem(key, ...members);
    }
    async smembers(key) {
        return this.client.smembers(key);
    }
    async keys(pattern) {
        return this.client.keys(pattern);
    }
    async flushPattern(pattern) {
        const keys = await this.keys(pattern);
        if (keys.length === 0)
            return 0;
        return this.client.del(...keys);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map