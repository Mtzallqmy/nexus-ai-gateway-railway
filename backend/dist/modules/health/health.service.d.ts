import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { RedisService } from "../../infrastructure/redis/redis.service";
import { QueueService } from "../../infrastructure/queue/queue.service";
export interface HealthCheckResult {
    status: "healthy" | "degraded" | "down" | "maintenance";
    timestamp: string;
    uptime: number;
    services: Record<string, {
        status: "healthy" | "degraded" | "down";
        latencyMs?: number;
        details?: Record<string, unknown>;
        error?: string;
    }>;
}
export declare class HealthService {
    private readonly prisma;
    private readonly redis;
    private readonly queue;
    private readonly config;
    private readonly logger;
    private readonly startTime;
    constructor(prisma: PrismaService, redis: RedisService, queue: QueueService, config: ConfigService);
    check(): Promise<HealthCheckResult>;
    checkDatabase(): Promise<{
        status: "healthy";
        latencyMs: number;
        details: {
            provider: string;
        };
        error?: undefined;
    } | {
        status: "down";
        error: string;
        latencyMs?: undefined;
        details?: undefined;
    }>;
    checkRedis(): Promise<{
        status: "healthy" | "degraded";
        latencyMs: number;
        details: {
            prefix: string | undefined;
        };
        error?: undefined;
    } | {
        status: "down";
        error: string;
        latencyMs?: undefined;
        details?: undefined;
    }>;
    checkQueue(): Promise<{
        status: "healthy";
        details: {
            queues: number;
            names: string[];
        };
        error?: undefined;
    } | {
        status: "down";
        error: string;
        details?: undefined;
    }>;
    liveness(): Promise<{
        status: string;
        timestamp: string;
    }>;
    readiness(): Promise<HealthCheckResult>;
}
