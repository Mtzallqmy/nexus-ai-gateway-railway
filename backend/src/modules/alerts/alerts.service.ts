/**
 * Alerts Service — Alert rules, evaluation, and management.
 * Types: provider_down, slow_provider, high_latency, quota_exceeded,
 * database_errors, redis_errors, sync_failure, unexpected_cost.
 */
import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { z } from "zod";

export const createAlertRuleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.string(),
  severity: z.enum(["INFO", "WARNING", "ERROR", "CRITICAL"]).default("WARNING"),
  metric: z.string(),
  condition: z.enum(["gt", "lt", "gte", "lte", "eq", "neq"]),
  threshold: z.number(),
  windowMinutes: z.number().int().min(1).default(5),
  cooldownMinutes: z.number().int().min(0).default(30),
  actions: z.array(z.record(z.unknown())).default([]),
});
export type CreateAlertRuleDto = z.infer<typeof createAlertRuleSchema>;

@Injectable()
export class AlertsService {
  private readonly logger = new Logger("AlertsService");

  constructor(private readonly prisma: PrismaService) {
    this.logger.log("Alerts service initialized");
    this.seedDefaultRules().catch((err) => this.logger.warn(`Default rules seed failed: ${err.message}`));
  }

  // ============================================================
  // DEFAULT ALERT RULES
  // ============================================================
  private async seedDefaultRules(): Promise<void> {
    const defaults = [
      { name: "Provider Down", type: "provider_down", metric: "provider.status", condition: "eq", threshold: 0, severity: "CRITICAL", windowMinutes: 1, cooldownMinutes: 60 },
      { name: "Slow Provider", type: "slow_provider", metric: "provider.latency_ms", condition: "gt", threshold: 5000, severity: "WARNING", windowMinutes: 5, cooldownMinutes: 30 },
      { name: "High Latency", type: "high_latency", metric: "request.latency_p95", condition: "gt", threshold: 3000, severity: "WARNING", windowMinutes: 5, cooldownMinutes: 15 },
      { name: "Quota Exceeded", type: "quota_exceeded", metric: "usage.exceeded", condition: "eq", threshold: 1, severity: "ERROR", windowMinutes: 1, cooldownMinutes: 60 },
      { name: "Database Errors", type: "database_errors", metric: "db.error_count", condition: "gt", threshold: 10, severity: "CRITICAL", windowMinutes: 5, cooldownMinutes: 30 },
      { name: "Redis Errors", type: "redis_errors", metric: "redis.error_count", condition: "gt", threshold: 10, severity: "CRITICAL", windowMinutes: 5, cooldownMinutes: 30 },
      { name: "Sync Failure", type: "sync_failure", metric: "sync.failed", condition: "eq", threshold: 1, severity: "ERROR", windowMinutes: 10, cooldownMinutes: 30 },
      { name: "Unexpected Cost", type: "unexpected_cost", metric: "cost.daily_anomaly", condition: "gt", threshold: 100, severity: "WARNING", windowMinutes: 60, cooldownMinutes: 1440 },
    ];

    for (const rule of defaults) {
      await this.prisma.alertRule.upsert({
        where: { name: rule.name },
        update: {},
        create: { ...rule, actions: [] } as never,
      });
    }
    this.logger.log(`Seeded ${defaults.length} default alert rules`);
  }

  // ============================================================
  // ALERT RULES CRUD
  // ============================================================
  async createRule(dto: CreateAlertRuleDto) {
    return this.prisma.alertRule.create({
      data: { ...dto, actions: dto.actions as Prisma.InputJsonValue } as never,
    });
  }

  async getRules(includeDisabled = false) {
    return this.prisma.alertRule.findMany({
      where: includeDisabled ? {} : { isEnabled: true },
      orderBy: { name: "asc" },
    });
  }

  async updateRule(id: string, dto: Partial<CreateAlertRuleDto>) {
    return this.prisma.alertRule.update({ where: { id }, data: dto as never });
  }

  async deleteRule(id: string) {
    await this.prisma.alertRule.delete({ where: { id } });
    return { message: "Rule deleted" };
  }

  // ============================================================
  // ALERT MANAGEMENT
  // ============================================================
  async getAlerts(status?: string, severity?: string, limit = 50) {
    const where: Prisma.AlertWhereInput = {};
    if (status) where.status = status as never;
    if (severity) where.severity = severity as never;
    return this.prisma.alert.findMany({
      where,
      orderBy: { triggeredAt: "desc" },
      take: limit,
    });
  }

  async acknowledgeAlert(id: string, userId: string): Promise<void> {
    await this.prisma.alert.update({
      where: { id },
      data: { status: "ACKNOWLEDGED", acknowledgedBy: userId, acknowledgedAt: new Date() },
    });
  }

  async resolveAlert(id: string, userId: string, reason?: string): Promise<void> {
    await this.prisma.alert.update({
      where: { id },
      data: { status: "RESOLVED", resolvedBy: userId, resolvedAt: new Date(), resolvedReason: reason },
    });
  }

  async triggerAlert(data: {
    name: string;
    type: string;
    severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
    message: string;
    resourceName?: string;
    resourceId?: string;
    currentValue?: string;
    threshold?: string;
    source?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.prisma.alert.create({
      data: {
        name: data.name,
        type: data.type,
        severity: data.severity,
        status: "ACTIVE",
        message: data.message,
        resourceName: data.resourceName,
        resourceId: data.resourceId,
        currentValue: data.currentValue,
        threshold: data.threshold,
        source: data.source ?? "system",
        metadata: (data.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });
    this.logger.warn(`Alert triggered: ${data.name} [${data.severity}] — ${data.message}`);
  }

  // ============================================================
  // ALERT EVALUATION (called by background job)
  // ============================================================
  async evaluateAlerts(): Promise<{ evaluated: number; triggered: number }> {
    const rules = await this.prisma.alertRule.findMany({ where: { isEnabled: true } });
    let triggered = 0;

    for (const rule of rules) {
      // Check cooldown
      if (rule.lastTriggeredAt) {
        const cooldownEnd = new Date(rule.lastTriggeredAt.getTime() + rule.cooldownMinutes * 60000);
        if (new Date() < cooldownEnd) continue;
      }

      // Evaluate rule (simplified — real impl would query metrics)
      const shouldTrigger = await this.evaluateRule(rule);
      if (shouldTrigger) {
        await this.triggerAlert({
          name: rule.name,
          type: rule.type,
          severity: rule.severity,
          message: `${rule.name}: ${rule.metric} ${rule.condition} ${rule.threshold}`,
          currentValue: "N/A",
          threshold: String(rule.threshold),
        });
        await this.prisma.alertRule.update({
          where: { id: rule.id },
          data: { lastTriggeredAt: new Date(), triggerCount: { increment: 1 } },
        });
        triggered++;
      }
    }

    return { evaluated: rules.length, triggered };
  }

  private async evaluateRule(rule: { type: string; metric: string; condition: string; threshold: number }): Promise<boolean> {
    // Simplified evaluation — real impl would query actual metrics
    // For now, return false (no alerts triggered in tests)
    void rule;
    return false;
  }
}
