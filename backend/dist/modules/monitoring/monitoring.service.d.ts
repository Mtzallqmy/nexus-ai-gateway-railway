import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { RedisService } from "../../infrastructure/redis/redis.service";
export declare class MonitoringService {
    private readonly prisma;
    private readonly redis;
    private readonly config;
    private readonly logger;
    private readonly startTime;
    constructor(prisma: PrismaService, redis: RedisService, config: ConfigService);
    getSystemMetrics(): Promise<{
        hostname: string;
        platform: NodeJS.Platform;
        arch: string;
        uptime: number;
        processUptime: number;
        cpu: {
            cores: number;
            model: string;
            speed: number;
            loadAvg1: number;
            loadAvg5: number;
            loadAvg15: number;
            usagePercent: number;
        };
        memory: {
            total: number;
            used: number;
            free: number;
            usagePercent: number;
        };
        disk: {
            total: number;
            used: number;
            free: number;
            usagePercent: number;
        };
        network: {
            interfaces: Record<string, unknown>;
        };
        process: {
            pid: number;
            memoryUsage: NodeJS.MemoryUsage;
            cpuUsage: NodeJS.CpuUsage;
        };
    }>;
    private getDiskMetrics;
    private getNetworkMetrics;
    getServiceHealth(): Promise<{
        timestamp: string;
        services: {
            postgresql: {
                [k: string]: unknown;
                status: string;
                latencyMs?: number;
                error?: string;
            };
            redis: {
                [k: string]: unknown;
                status: string;
                latencyMs?: number;
                error?: string;
            };
            litellm: {
                [k: string]: unknown;
                status: string;
                latencyMs?: number;
                error?: string;
            };
            nestjs: {
                [k: string]: unknown;
                status: string;
                latencyMs?: number;
                error?: string;
            };
            nextjs: {
                status: string;
                url: string;
                message: string;
            };
        };
    }>;
    private checkPostgreSQL;
    private checkRedis;
    private checkLiteLLM;
    private checkNestJS;
    private formatResult;
    getHealthDashboard(): Promise<{
        timestamp: string;
        system: {
            hostname: string;
            platform: NodeJS.Platform;
            arch: string;
            uptime: number;
            processUptime: number;
            cpu: {
                cores: number;
                model: string;
                speed: number;
                loadAvg1: number;
                loadAvg5: number;
                loadAvg15: number;
                usagePercent: number;
            };
            memory: {
                total: number;
                used: number;
                free: number;
                usagePercent: number;
            };
            disk: {
                total: number;
                used: number;
                free: number;
                usagePercent: number;
            };
            network: {
                interfaces: Record<string, unknown>;
            };
            process: {
                pid: number;
                memoryUsage: NodeJS.MemoryUsage;
                cpuUsage: NodeJS.CpuUsage;
            };
        };
        services: {
            postgresql: {
                [k: string]: unknown;
                status: string;
                latencyMs?: number;
                error?: string;
            };
            redis: {
                [k: string]: unknown;
                status: string;
                latencyMs?: number;
                error?: string;
            };
            litellm: {
                [k: string]: unknown;
                status: string;
                latencyMs?: number;
                error?: string;
            };
            nestjs: {
                [k: string]: unknown;
                status: string;
                latencyMs?: number;
                error?: string;
            };
            nextjs: {
                status: string;
                url: string;
                message: string;
            };
        };
        recentMetrics: {
            id: string;
            metricName: string;
            metricValue: number;
            metricUnit: string | null;
            labels: Prisma.JsonValue;
            recordedAt: Date;
            source: string;
        }[];
    }>;
    getRecentMetrics(limit?: number): Promise<{
        id: string;
        metricName: string;
        metricValue: number;
        metricUnit: string | null;
        labels: Prisma.JsonValue;
        recordedAt: Date;
        source: string;
    }[]>;
    recordMetric(name: string, value: number, unit?: string, labels?: Record<string, unknown>, source?: string): Promise<void>;
    getIntegrationStatus(): Promise<{
        grafana: {
            enabled: boolean;
            url: string | null;
            apiKey: string | null;
            dashboards: string[];
        };
        prometheus: {
            enabled: boolean;
            url: string | null;
            pushgateway: string | null;
        };
        uptimeKuma: {
            enabled: boolean;
            url: string | null;
            pushToken: string | null;
        };
    }>;
    pushToPrometheus(metric: string, value: number, labels?: Record<string, string>): Promise<void>;
    pushToUptimeKuma(status: "up" | "down", message?: string): Promise<void>;
}
