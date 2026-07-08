/**
 * LiteLLM Cache Layer
 *
 * Wraps the global RedisService to provide a typed, prefixed cache
 * for LiteLLM models, providers, health, and config snapshots.
 */
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { RedisService } from "../../infrastructure/redis/redis.service";
import { LITELLM_CACHE_KEYS, LITELLM_LOG_CONTEXTS } from "./litellm.constants";
import type { ILiteLLMCache } from "./litellm.interfaces";

@Injectable()
export class LiteLLMCache implements ILiteLLMCache, OnModuleInit {
  private readonly logger = new Logger(LITELLM_LOG_CONTEXTS.CACHE);
  private readonly ttlSeconds: number;

  constructor(
    private readonly redis: RedisService,
    ttlSeconds = 300
  ) {
    this.ttlSeconds = ttlSeconds;
  }

  onModuleInit(): void {
    this.logger.log(`LiteLLM cache initialized (default TTL ${this.ttlSeconds}s)`);
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redis.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      this.logger.warn(`Cache get failed for '${key}': ${(err as Error).message}`);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const ttl = ttlSeconds ?? this.ttlSeconds;
      const serialized = JSON.stringify(value);
      await this.redis.set(key, serialized, ttl);
    } catch (err) {
      this.logger.warn(`Cache set failed for '${key}': ${(err as Error).message}`);
    }
  }

  async del(...keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;
    try {
      return await this.redis.del(...keys);
    } catch (err) {
      this.logger.warn(`Cache del failed: ${(err as Error).message}`);
      return 0;
    }
  }

  async flushPattern(pattern: string): Promise<number> {
    try {
      return await this.redis.flushPattern(pattern);
    } catch (err) {
      this.logger.warn(`Cache flushPattern failed for '${pattern}': ${(err as Error).message}`);
      return 0;
    }
  }

  // ============================================================
  // Domain-specific helpers
  // ============================================================

  async getModels<T>(): Promise<T | null> {
    return this.get<T>(LITELLM_CACHE_KEYS.MODELS);
  }
  async setModels<T>(value: T): Promise<void> {
    await this.set(LITELLM_CACHE_KEYS.MODELS, value);
  }
  async invalidateModels(): Promise<void> {
    await this.del(LITELLM_CACHE_KEYS.MODELS);
    await this.flushPattern("litellm:models:*");
  }

  async getHealth<T>(): Promise<T | null> {
    return this.get<T>(LITELLM_CACHE_KEYS.HEALTH);
  }
  async setHealth<T>(value: T): Promise<void> {
    await this.set(LITELLM_CACHE_KEYS.HEALTH, value, 30); // shorter TTL
  }

  async getVersion<T>(): Promise<T | null> {
    return this.get<T>(LITELLM_CACHE_KEYS.VERSION);
  }
  async setVersion<T>(value: T): Promise<void> {
    await this.set(LITELLM_CACHE_KEYS.VERSION, value, 3600); // 1h
  }

  async invalidateAll(): Promise<void> {
    await this.flushPattern("litellm:*");
    this.logger.log(`All LiteLLM cache entries invalidated`);
  }
}
