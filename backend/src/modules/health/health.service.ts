import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { RedisService } from "../../infrastructure/redis/redis.service";
import { QueueService } from "../../infrastructure/queue/queue.service";

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "down" | "maintenance";
  timestamp: string;
  uptime: number;
  services: Record<
    string,
    {
      status: "healthy" | "degraded" | "down";
      latencyMs?: number;
      details?: Record<string, unknown>;
      error?: string;
    }
  >;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly queue: QueueService,
    private readonly config: ConfigService
  ) {}

  async check(): Promise<HealthCheckResult> {
    const [db, cache, queue] = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkQueue(),
    ]);

    const services: HealthCheckResult["services"] = {};

    if (db.status === "fulfilled") {
      services.database = db.value;
    } else {
      services.database = { status: "down", error: (db.reason as Error)?.message };
    }
    if (cache.status === "fulfilled") {
      services.redis = cache.value;
    } else {
      services.redis = { status: "down", error: (cache.reason as Error)?.message };
    }
    if (queue.status === "fulfilled") {
      services.queue = queue.value;
    } else {
      services.queue = { status: "down", error: (queue.reason as Error)?.message };
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
      await this.prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      return {
        status: "healthy" as const,
        latencyMs: latency,
        details: { provider: "postgresql" },
      };
    } catch (err) {
      return {
        status: "down" as const,
        error: (err as Error).message,
      };
    }
  }

  async checkRedis() {
    const start = Date.now();
    try {
      const pong = await this.redis.raw.ping();
      return {
        status: pong === "PONG" ? ("healthy" as const) : ("degraded" as const),
        latencyMs: Date.now() - start,
        details: { prefix: this.config.get<string>("app.redis.keyPrefix") },
      };
    } catch (err) {
      return { status: "down" as const, error: (err as Error).message };
    }
  }

  async checkQueue() {
    try {
      const queues = this.queue.listQueues();
      return {
        status: "healthy" as const,
        details: { queues: queues.length, names: queues },
      };
    } catch (err) {
      return { status: "down" as const, error: (err as Error).message };
    }
  }

  async liveness() {
    return { status: "alive", timestamp: new Date().toISOString() };
  }

  async readiness() {
    return this.check();
  }
}
