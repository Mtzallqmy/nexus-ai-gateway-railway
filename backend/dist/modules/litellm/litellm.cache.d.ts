import { OnModuleInit } from "@nestjs/common";
import { RedisService } from "../../infrastructure/redis/redis.service";
import type { ILiteLLMCache } from "./litellm.interfaces";
export declare class LiteLLMCache implements ILiteLLMCache, OnModuleInit {
    private readonly redis;
    private readonly logger;
    private readonly ttlSeconds;
    constructor(redis: RedisService, ttlSeconds?: number);
    onModuleInit(): void;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    del(...keys: string[]): Promise<number>;
    flushPattern(pattern: string): Promise<number>;
    getModels<T>(): Promise<T | null>;
    setModels<T>(value: T): Promise<void>;
    invalidateModels(): Promise<void>;
    getHealth<T>(): Promise<T | null>;
    setHealth<T>(value: T): Promise<void>;
    getVersion<T>(): Promise<T | null>;
    setVersion<T>(value: T): Promise<void>;
    invalidateAll(): Promise<void>;
}
