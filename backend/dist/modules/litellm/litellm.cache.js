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
exports.LiteLLMCache = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
const litellm_constants_1 = require("./litellm.constants");
let LiteLLMCache = class LiteLLMCache {
    redis;
    logger = new common_1.Logger(litellm_constants_1.LITELLM_LOG_CONTEXTS.CACHE);
    ttlSeconds;
    constructor(redis, ttlSeconds = 300) {
        this.redis = redis;
        this.ttlSeconds = ttlSeconds;
    }
    onModuleInit() {
        this.logger.log(`LiteLLM cache initialized (default TTL ${this.ttlSeconds}s)`);
    }
    async get(key) {
        try {
            const raw = await this.redis.get(key);
            if (!raw)
                return null;
            return JSON.parse(raw);
        }
        catch (err) {
            this.logger.warn(`Cache get failed for '${key}': ${err.message}`);
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        try {
            const ttl = ttlSeconds ?? this.ttlSeconds;
            const serialized = JSON.stringify(value);
            await this.redis.set(key, serialized, ttl);
        }
        catch (err) {
            this.logger.warn(`Cache set failed for '${key}': ${err.message}`);
        }
    }
    async del(...keys) {
        if (keys.length === 0)
            return 0;
        try {
            return await this.redis.del(...keys);
        }
        catch (err) {
            this.logger.warn(`Cache del failed: ${err.message}`);
            return 0;
        }
    }
    async flushPattern(pattern) {
        try {
            return await this.redis.flushPattern(pattern);
        }
        catch (err) {
            this.logger.warn(`Cache flushPattern failed for '${pattern}': ${err.message}`);
            return 0;
        }
    }
    async getModels() {
        return this.get(litellm_constants_1.LITELLM_CACHE_KEYS.MODELS);
    }
    async setModels(value) {
        await this.set(litellm_constants_1.LITELLM_CACHE_KEYS.MODELS, value);
    }
    async invalidateModels() {
        await this.del(litellm_constants_1.LITELLM_CACHE_KEYS.MODELS);
        await this.flushPattern("litellm:models:*");
    }
    async getHealth() {
        return this.get(litellm_constants_1.LITELLM_CACHE_KEYS.HEALTH);
    }
    async setHealth(value) {
        await this.set(litellm_constants_1.LITELLM_CACHE_KEYS.HEALTH, value, 30);
    }
    async getVersion() {
        return this.get(litellm_constants_1.LITELLM_CACHE_KEYS.VERSION);
    }
    async setVersion(value) {
        await this.set(litellm_constants_1.LITELLM_CACHE_KEYS.VERSION, value, 3600);
    }
    async invalidateAll() {
        await this.flushPattern("litellm:*");
        this.logger.log(`All LiteLLM cache entries invalidated`);
    }
};
exports.LiteLLMCache = LiteLLMCache;
exports.LiteLLMCache = LiteLLMCache = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService, Object])
], LiteLLMCache);
//# sourceMappingURL=litellm.cache.js.map