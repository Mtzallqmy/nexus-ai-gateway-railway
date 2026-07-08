import { MonitoringService } from "./monitoring.service";
export declare class MonitoringController {
    private readonly monitoring;
    constructor(monitoring: MonitoringService);
    system(): Promise<{
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
    services(): Promise<{
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
    dashboard(): Promise<{
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
            labels: import(".prisma/client/runtime/library").JsonValue;
            recordedAt: Date;
            source: string;
        }[];
    }>;
    integrations(): Promise<{
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
    metrics(): Promise<{
        id: string;
        metricName: string;
        metricValue: number;
        metricUnit: string | null;
        labels: import(".prisma/client/runtime/library").JsonValue;
        recordedAt: Date;
        source: string;
    }[]>;
    recordMetric(body: {
        name: string;
        value: number;
        unit?: string;
        labels?: Record<string, unknown>;
    }): Promise<{
        message: string;
    }>;
}
