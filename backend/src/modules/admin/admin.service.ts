/**
 * Admin Service — System, Provider, Billing, Monitoring, Notification settings.
 */
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

export type AdminCategory = "system" | "provider" | "billing" | "monitoring" | "notification";

@Injectable()
export class AdminService {
  private readonly logger = new Logger("AdminService");

  constructor(private readonly prisma: PrismaService) {
    this.seedDefaults().catch((err) => this.logger.warn(`Admin defaults seed failed: ${err.message}`));
  }

  private async seedDefaults(): Promise<void> {
    const defaults = [
      { category: "system", key: "system.name", value: "Moataz AI Gateway", type: "STRING", isPublic: true, description: "Platform name" },
      { category: "system", key: "system.maintenance_mode", value: false, type: "BOOLEAN", isPublic: true, description: "Maintenance mode flag" },
      { category: "system", key: "system.signup_enabled", value: true, type: "BOOLEAN", isPublic: true, description: "Allow new signups" },
      { category: "provider", key: "provider.default_timeout_ms", value: 30000, type: "NUMBER", description: "Default provider timeout" },
      { category: "provider", key: "provider.max_retries", value: 3, type: "NUMBER", description: "Max retries per provider" },
      { category: "billing", key: "billing.currency", value: "USD", type: "STRING", isPublic: true, description: "Default currency" },
      { category: "billing", key: "billing.trial_days", value: 14, type: "NUMBER", isPublic: true, description: "Default trial period" },
      { category: "monitoring", key: "monitoring.health_check_interval_ms", value: 30000, type: "NUMBER", description: "Health check interval" },
      { category: "monitoring", key: "monitoring.metrics_retention_days", value: 90, type: "NUMBER", description: "Metrics retention" },
      { category: "notification", key: "notification.email_enabled", value: true, type: "BOOLEAN", description: "Email notifications enabled" },
      { category: "notification", key: "notification.push_enabled", value: true, type: "BOOLEAN", description: "Push notifications enabled" },
    ];

    for (const d of defaults) {
      await this.prisma.adminSetting.upsert({
        where: { key: d.key },
        update: {},
        create: {
          category: d.category,
          key: d.key,
          value: d.value as Prisma.InputJsonValue,
          type: d.type as never,
          description: d.description,
          isPublic: d.isPublic ?? false,
        },
      });
    }
  }

  async getSettings(category?: AdminCategory, publicOnly = false) {
    const where: Prisma.AdminSettingWhereInput = {};
    if (category) where.category = category;
    if (publicOnly) where.isPublic = true;
    return this.prisma.adminSetting.findMany({
      where,
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });
  }

  async getSetting(key: string) {
    const setting = await this.prisma.adminSetting.findUnique({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting '${key}' not found`);
    return setting;
  }

  async getSettingValue<T = unknown>(key: string, defaultValue?: T): Promise<T | undefined> {
    const setting = await this.prisma.adminSetting.findUnique({ where: { key } });
    if (!setting) return defaultValue;
    return setting.value as T;
  }

  async setSetting(key: string, value: unknown, updatedBy?: string): Promise<void> {
    const existing = await this.prisma.adminSetting.findUnique({ where: { key } });
    if (existing?.isReadOnly) {
      throw new Error(`Setting '${key}' is read-only`);
    }
    await this.prisma.adminSetting.upsert({
      where: { key },
      update: { value: value as Prisma.InputJsonValue, updatedById: updatedBy },
      create: {
        key,
        value: value as Prisma.InputJsonValue,
        category: "system",
        type: "JSON",
        updatedById: updatedBy,
      },
    });
  }

  async deleteSetting(key: string): Promise<void> {
    const setting = await this.getSetting(key);
    if (setting.isReadOnly) throw new Error(`Setting '${key}' is read-only`);
    await this.prisma.adminSetting.delete({ where: { key } });
  }

  // ============================================================
  // BULK OPERATIONS
  // ============================================================
  async getSystemOverview() {
    const [settings, users, orgs, subscriptions, alerts, reports] = await Promise.all([
      this.prisma.adminSetting.count(),
      this.prisma.user.count(),
      this.prisma.organization.count(),
      this.prisma.subscription.count({ where: { status: "ACTIVE" } }),
      this.prisma.alert.count({ where: { status: "ACTIVE" } }),
      this.prisma.report.count({ where: { status: "READY" } }),
    ]);

    return {
      timestamp: new Date().toISOString(),
      stats: { settings, users, orgs, activeSubscriptions: subscriptions, activeAlerts: alerts, readyReports: reports },
    };
  }
}
