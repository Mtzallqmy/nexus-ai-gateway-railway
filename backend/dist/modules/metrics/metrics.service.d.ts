import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { RedisService } from "../../infrastructure/redis/redis.service";
import { QueueService } from "../../infrastructure/queue/queue.service";
export interface SystemMetrics {
    timestamp: string;
    uptime: number;
    database: {
        users: number;
        organizations: number;
        projects: number;
        apiKeys: number;
        activeSessions: number;
        auditLogs: number;
    };
    cache: {
        connected: boolean;
        info?: Record<string, string>;
    };
    queues: Array<{
        name: string;
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
    }>;
    memory: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
    };
}
export declare class MetricsService {
    private readonly prisma;
    private readonly redis;
    private readonly queue;
    private readonly logger;
    private readonly startTime;
    constructor(prisma: PrismaService, redis: RedisService, queue: QueueService);
    collect(): Promise<SystemMetrics>;
    private parseRedisInfo;
}
