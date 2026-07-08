/**
 * Cost Tracking Service — Tracks costs across all dimensions.
 * Provider, User, Organization, Project, Model, Daily, Monthly.
 * Estimated vs Real cost.
 */
import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

@Injectable()
export class CostTrackingService {
  private readonly logger = new Logger("CostTrackingService");

  constructor(private readonly prisma: PrismaService) {}

  async getCostByProvider(startDate?: Date, endDate?: Date) {
    const where: Prisma.UsageRecordWhereInput = {};
    if (startDate || endDate) {
      where.periodStart = {};
      if (startDate) where.periodStart.gte = startDate;
      if (endDate) where.periodStart.lte = endDate;
    }
    const grouped = await this.prisma.usageRecord.groupBy({
      by: ["providerName"],
      where,
      _sum: { cost: true, estimatedCost: true, realCost: true, requestCount: true, totalTokens: true },
    });
    return grouped.map((g) => ({
      provider: g.providerName,
      cost: Number(g._sum.cost ?? 0),
      estimatedCost: Number(g._sum.estimatedCost ?? 0),
      realCost: Number(g._sum.realCost ?? 0),
      requests: g._sum.requestCount ?? 0,
      tokens: g._sum.totalTokens ?? 0,
    }));
  }

  async getCostByUser(organizationId?: string, startDate?: Date, endDate?: Date) {
    const where: Prisma.UsageRecordWhereInput = {};
    if (organizationId) where.organizationId = organizationId;
    if (startDate || endDate) {
      where.periodStart = {};
      if (startDate) where.periodStart.gte = startDate;
      if (endDate) where.periodStart.lte = endDate;
    }
    const grouped = await this.prisma.usageRecord.groupBy({
      by: ["userId"],
      where,
      _sum: { cost: true, estimatedCost: true, realCost: true, requestCount: true, totalTokens: true },
    });
    return grouped.map((g) => ({
      userId: g.userId,
      cost: Number(g._sum.cost ?? 0),
      estimatedCost: Number(g._sum.estimatedCost ?? 0),
      realCost: Number(g._sum.realCost ?? 0),
      requests: g._sum.requestCount ?? 0,
      tokens: g._sum.totalTokens ?? 0,
    }));
  }

  async getCostByOrganization(startDate?: Date, endDate?: Date) {
    const where: Prisma.UsageRecordWhereInput = {};
    if (startDate || endDate) {
      where.periodStart = {};
      if (startDate) where.periodStart.gte = startDate;
      if (endDate) where.periodStart.lte = endDate;
    }
    const grouped = await this.prisma.usageRecord.groupBy({
      by: ["organizationId"],
      where,
      _sum: { cost: true, estimatedCost: true, realCost: true, requestCount: true, totalTokens: true },
    });
    return grouped.map((g) => ({
      organizationId: g.organizationId,
      cost: Number(g._sum.cost ?? 0),
      estimatedCost: Number(g._sum.estimatedCost ?? 0),
      realCost: Number(g._sum.realCost ?? 0),
      requests: g._sum.requestCount ?? 0,
      tokens: g._sum.totalTokens ?? 0,
    }));
  }

  async getCostByModel(startDate?: Date, endDate?: Date) {
    const where: Prisma.UsageRecordWhereInput = {};
    if (startDate || endDate) {
      where.periodStart = {};
      if (startDate) where.periodStart.gte = startDate;
      if (endDate) where.periodStart.lte = endDate;
    }
    const grouped = await this.prisma.usageRecord.groupBy({
      by: ["modelName", "providerName"],
      where,
      _sum: { cost: true, estimatedCost: true, realCost: true, requestCount: true, totalTokens: true },
    });
    return grouped.map((g) => ({
      model: g.modelName,
      provider: g.providerName,
      cost: Number(g._sum.cost ?? 0),
      estimatedCost: Number(g._sum.estimatedCost ?? 0),
      realCost: Number(g._sum.realCost ?? 0),
      requests: g._sum.requestCount ?? 0,
      tokens: g._sum.totalTokens ?? 0,
    }));
  }

  async getDailyCost(organizationId?: string, days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const where: Prisma.UsageRecordWhereInput = {
      periodStart: { gte: startDate },
    };
    if (organizationId) where.organizationId = organizationId;

    const records = await this.prisma.usageRecord.findMany({
      where,
      orderBy: { periodStart: "asc" },
      select: { periodStart: true, cost: true, estimatedCost: true, realCost: true },
    });

    const buckets = new Map<string, { cost: number; estimated: number; real: number }>();
    for (const r of records) {
      const key = r.periodStart.toISOString().slice(0, 10);
      const existing = buckets.get(key) ?? { cost: 0, estimated: 0, real: 0 };
      existing.cost += Number(r.cost);
      existing.estimated += Number(r.estimatedCost);
      existing.real += Number(r.realCost);
      buckets.set(key, existing);
    }

    return Array.from(buckets.entries()).map(([date, data]) => ({ date, ...data }));
  }

  async getMonthlyCost(organizationId?: string, months = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    const where: Prisma.UsageRecordWhereInput = {
      periodStart: { gte: startDate },
    };
    if (organizationId) where.organizationId = organizationId;

    const records = await this.prisma.usageRecord.findMany({
      where,
      orderBy: { periodStart: "asc" },
      select: { periodStart: true, cost: true, estimatedCost: true, realCost: true },
    });

    const buckets = new Map<string, { cost: number; estimated: number; real: number }>();
    for (const r of records) {
      const key = r.periodStart.toISOString().slice(0, 7);
      const existing = buckets.get(key) ?? { cost: 0, estimated: 0, real: 0 };
      existing.cost += Number(r.cost);
      existing.estimated += Number(r.estimatedCost);
      existing.real += Number(r.realCost);
      buckets.set(key, existing);
    }

    return Array.from(buckets.entries()).map(([month, data]) => ({ month, ...data }));
  }

  async getTotalCost(organizationId?: string) {
    const where: Prisma.UsageRecordWhereInput = {};
    if (organizationId) where.organizationId = organizationId;
    const result = await this.prisma.usageRecord.aggregate({
      where,
      _sum: { cost: true, estimatedCost: true, realCost: true },
    });
    return {
      totalCost: Number(result._sum.cost ?? 0),
      totalEstimated: Number(result._sum.estimatedCost ?? 0),
      totalReal: Number(result._sum.realCost ?? 0),
    };
  }
}
