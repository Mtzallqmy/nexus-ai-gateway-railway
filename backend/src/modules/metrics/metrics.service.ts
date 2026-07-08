import { Injectable, Logger } from "@nestjs/common";
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

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly queue: QueueService
  ) {}

  async collect(): Promise<SystemMetrics> {
    const [users, organizations, projects, apiKeys, activeSessions, auditLogs] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.organization.count({ where: { deletedAt: null } }),
      this.prisma.project.count({ where: { deletedAt: null } }),
      this.prisma.apiKey.count({ where: { status: "ACTIVE" } }),
      this.prisma.session.count({ where: { status: "ACTIVE" } }),
      this.prisma.auditLog.count(),
    ]);

    const queueNames = this.queue.listQueues();
    const queueStats = await Promise.all(
      queueNames.map(async (name) => ({
        name,
        ...(await this.queue.getStats(name).catch(() => ({
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 0,
          delayed: 0,
        }))),
      }))
    );

    let redisInfo: Record<string, string> | undefined;
    let redisConnected = false;
    try {
      const raw = await this.redis.raw.info();
      redisConnected = true;
      redisInfo = this.parseRedisInfo(raw);
    } catch {
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

  private parseRedisInfo(raw: string): Record<string, string> {
    const out: Record<string, string> = {};
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf(":");
      if (idx < 0) continue;
      const key = trimmed.slice(0, idx);
      const value = trimmed.slice(idx + 1);
      out[key] = value;
    }
    return out;
  }
}
