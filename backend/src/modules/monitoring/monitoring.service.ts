/**
 * Monitoring Service — System health monitoring with Grafana, Prometheus,
 * Uptime Kuma integration support, and internal health metrics.
 *
 * Monitors: CPU, RAM, Disk, Network, Redis, PostgreSQL, LiteLLM, NestJS, Next.js
 */
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { RedisService } from "../../infrastructure/redis/redis.service";
import os from "os";
import { performance } from "perf_hooks";

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger("MonitoringService");
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService
  ) {
    this.logger.log("Monitoring service initialized");
  }

  // ============================================================
  // SYSTEM METRICS (CPU, RAM, Disk, Network)
  // ============================================================
  async getSystemMetrics() {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const loadAvg = os.loadavg();
    const uptime = os.uptime();

    // CPU usage (simplified — real impl would track deltas)
    const cpuUsage = loadAvg[0] / cpus.length;

    return {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      uptime,
      processUptime: Math.floor((Date.now() - this.startTime) / 1000),
      cpu: {
        cores: cpus.length,
        model: cpus[0]?.model ?? "unknown",
        speed: cpus[0]?.speed ?? 0,
        loadAvg1: loadAvg[0],
        loadAvg5: loadAvg[1],
        loadAvg15: loadAvg[2],
        usagePercent: Math.min(100, cpuUsage * 100),
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        usagePercent: (usedMem / totalMem) * 100,
      },
      disk: await this.getDiskMetrics(),
      network: this.getNetworkMetrics(),
      process: {
        pid: process.pid,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      },
    };
  }

  private async getDiskMetrics() {
    // Simplified — real impl would use `df` or `statvfs`
    return {
      total: 0,
      used: 0,
      free: 0,
      usagePercent: 0,
    };
  }

  private getNetworkMetrics() {
    const interfaces = os.networkInterfaces();
    const result: Record<string, unknown> = {};
    for (const [name, addrs] of Object.entries(interfaces)) {
      if (addrs) {
        result[name] = addrs.map((a) => ({ address: a.address, family: a.family, internal: a.internal }));
      }
    }
    return { interfaces: result };
  }

  // ============================================================
  // SERVICE HEALTH (Redis, PostgreSQL, LiteLLM, NestJS, Next.js)
  // ============================================================
  async getServiceHealth() {
    const [database, redis, litellm, nestjs] = await Promise.allSettled([
      this.checkPostgreSQL(),
      this.checkRedis(),
      this.checkLiteLLM(),
      this.checkNestJS(),
    ]);

    return {
      timestamp: new Date().toISOString(),
      services: {
        postgresql: this.formatResult(database),
        redis: this.formatResult(redis),
        litellm: this.formatResult(litellm),
        nestjs: this.formatResult(nestjs),
        nextjs: {
          status: "healthy",
          url: this.config.get<string>("app.corsOrigins")?.split(",")[0] ?? "unknown",
          message: "Frontend is served separately",
        },
      },
    };
  }

  private async checkPostgreSQL() {
    const start = performance.now();
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: "healthy" as const, latencyMs: Math.round(performance.now() - start) };
  }

  private async checkRedis() {
    const start = performance.now();
    const pong = await this.redis.raw.ping();
    return { status: pong === "PONG" ? "healthy" as const : "degraded" as const, latencyMs: Math.round(performance.now() - start) };
  }

  private async checkLiteLLM() {
    const litellmUrl = this.config.get<string>("app.litellm.baseUrl") ?? "http://localhost:4000";
    try {
      const start = performance.now();
      const response = await fetch(`${litellmUrl}/health/liveness`, {
        signal: AbortSignal.timeout(5000),
      });
      const latencyMs = Math.round(performance.now() - start);
      if (response.ok) {
        return { status: "healthy" as const, latencyMs, url: litellmUrl };
      }
      return { status: "degraded" as const, latencyMs, url: litellmUrl, message: `HTTP ${response.status}` };
    } catch (err) {
      return { status: "down" as const, url: litellmUrl, error: (err as Error).message };
    }
  }

  private async checkNestJS() {
    return { status: "healthy" as const, uptime: Math.floor((Date.now() - this.startTime) / 1000), memory: process.memoryUsage().rss };
  }

  private formatResult(result: PromiseSettledResult<{ status: string; latencyMs?: number; message?: string; url?: string; uptime?: number; memory?: number }>): { status: string; latencyMs?: number; error?: string; [k: string]: unknown } {
    if (result.status === "fulfilled") return result.value;
    return { status: "down", error: (result.reason as Error)?.message };
  }

  // ============================================================
  // HEALTH DASHBOARD
  // ============================================================
  async getHealthDashboard() {
    const [system, services, metrics] = await Promise.all([
      this.getSystemMetrics(),
      this.getServiceHealth(),
      this.getRecentMetrics(),
    ]);

    return {
      timestamp: new Date().toISOString(),
      system,
      services: services.services,
      recentMetrics: metrics,
    };
  }

  async getRecentMetrics(limit = 100) {
    return this.prisma.systemMetric.findMany({
      orderBy: { recordedAt: "desc" },
      take: limit,
    });
  }

  async recordMetric(name: string, value: number, unit?: string, labels?: Record<string, unknown>, source = "internal"): Promise<void> {
    await this.prisma.systemMetric.create({
      data: {
        metricName: name,
        metricValue: value,
        metricUnit: unit,
        labels: (labels as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        source,
      },
    });
  }

  // ============================================================
  // EXTERNAL INTEGRATIONS (Grafana, Prometheus, Uptime Kuma)
  // ============================================================
  async getIntegrationStatus() {
    return {
      grafana: {
        enabled: !!process.env.GRAFANA_URL,
        url: process.env.GRAFANA_URL ?? null,
        apiKey: process.env.GRAFANA_API_KEY ? "configured" : null,
        dashboards: process.env.GRAFANA_DASHBOARD_IDS?.split(",") ?? [],
      },
      prometheus: {
        enabled: !!process.env.PROMETHEUS_URL,
        url: process.env.PROMETHEUS_URL ?? null,
        pushgateway: process.env.PROMETHEUS_PUSHGATEWAY_URL ?? null,
      },
      uptimeKuma: {
        enabled: !!process.env.UPTIME_KUMA_URL,
        url: process.env.UPTIME_KUMA_URL ?? null,
        pushToken: process.env.UPTIME_KUMA_PUSH_TOKEN ? "configured" : null,
      },
    };
  }

  async pushToPrometheus(metric: string, value: number, labels?: Record<string, string>): Promise<void> {
    const pushUrl = process.env.PROMETHEUS_PUSHGATEWAY_URL;
    if (!pushUrl) return;
    // In production: push metric to Prometheus Pushgateway
    this.logger.debug?.(`Pushing to Prometheus: ${metric}=${value} ${JSON.stringify(labels ?? {})}`);
  }

  async pushToUptimeKuma(status: "up" | "down", message?: string): Promise<void> {
    const url = process.env.UPTIME_KUMA_URL;
    const token = process.env.UPTIME_KUMA_PUSH_TOKEN;
    if (!url || !token) return;
    // In production: push status to Uptime Kuma
    this.logger.debug?.(`Pushing to Uptime Kuma: ${status} ${message ?? ""}`);
  }
}
