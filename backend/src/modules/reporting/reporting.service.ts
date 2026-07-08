/**
 * Reporting Service — Daily, weekly, monthly reports with CSV, Excel, PDF export.
 */
import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { z } from "zod";

export const createReportSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]),
  format: z.enum(["CSV", "EXCEL", "PDF", "JSON"]).default("CSV"),
  organizationId: z.string().uuid().optional(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  filters: z.record(z.unknown()).default({}),
});
export type CreateReportDto = z.infer<typeof createReportSchema>;

@Injectable()
export class ReportingService {
  private readonly logger = new Logger("ReportingService");

  constructor(private readonly prisma: PrismaService) {}

  async createReport(dto: CreateReportDto, userId: string) {
    const report = await this.prisma.report.create({
      data: {
        name: dto.name,
        type: dto.type as never,
        format: dto.format as never,
        status: "GENERATING",
        organizationId: dto.organizationId,
        requestedBy: userId,
        periodStart: new Date(dto.periodStart),
        periodEnd: new Date(dto.periodEnd),
        filters: (dto.filters as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Generate report data
    try {
      const data = await this.collectReportData(dto);
      const exportData = this.formatExport(data, dto.format);

      await this.prisma.report.update({
        where: { id: report.id },
        data: {
          status: "READY",
          rowCount: Array.isArray(data) ? data.length : 1,
          fileUrl: exportData.url,
          fileSize: BigInt(Buffer.byteLength(exportData.content)),
          generatedAt: new Date(),
        },
      });

      return { reportId: report.id, status: "READY", format: dto.format, data: exportData.content, rowCount: Array.isArray(data) ? data.length : 1 };
    } catch (err) {
      await this.prisma.report.update({
        where: { id: report.id },
        data: { status: "FAILED", errorMessage: (err as Error).message },
      });
      throw err;
    }
  }

  async getReports(organizationId?: string, limit = 50) {
    const where: Prisma.ReportWhereInput = {};
    if (organizationId) where.organizationId = organizationId;
    return this.prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async getReport(id: string) {
    return this.prisma.report.findUnique({ where: { id } });
  }

  async getScheduledReports(organizationId?: string) {
    const where: Prisma.ScheduledReportWhereInput = {};
    if (organizationId) where.organizationId = organizationId;
    return this.prisma.scheduledReport.findMany({ where, orderBy: { createdAt: "desc" } });
  }

  async createScheduledReport(dto: {
    name: string;
    type: "DAILY" | "WEEKLY" | "MONTHLY";
    format: "CSV" | "EXCEL" | "PDF" | "JSON";
    organizationId?: string;
    recipientEmails: string[];
    cronExpression: string;
    filters?: Record<string, unknown>;
  }) {
    return this.prisma.scheduledReport.create({
      data: {
        ...dto,
        type: dto.type as never,
        format: dto.format as never,
        filters: (dto.filters as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        nextRunAt: this.calculateNextRun(dto.cronExpression),
      } as never,
    });
  }

  async deleteScheduledReport(id: string) {
    await this.prisma.scheduledReport.delete({ where: { id } });
    return { message: "Scheduled report deleted" };
  }

  // ============================================================
  // HELPERS
  // ============================================================
  private async collectReportData(dto: CreateReportDto) {
    const where: Prisma.UsageRecordWhereInput = {
      periodStart: { gte: new Date(dto.periodStart), lte: new Date(dto.periodEnd) },
    };
    if (dto.organizationId) where.organizationId = dto.organizationId;

    return this.prisma.usageRecord.findMany({
      where,
      orderBy: { periodStart: "asc" },
      select: {
        periodStart: true,
        providerName: true,
        modelName: true,
        endpoint: true,
        requestCount: true,
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        cost: true,
        latencyMs: true,
        errorCount: true,
        successCount: true,
      },
    });
  }

  private formatExport(data: unknown[], format: string): { content: string; url: string } {
    switch (format) {
      case "CSV":
        return { content: this.toCSV(data), url: `data:text/csv;base64,${Buffer.from(this.toCSV(data)).toString("base64")}` };
      case "JSON":
        return { content: JSON.stringify(data, null, 2), url: `data:application/json;base64,${Buffer.from(JSON.stringify(data)).toString("base64")}` };
      case "EXCEL":
        // Real impl would use a library like exceljs — for now return CSV (Excel-compatible)
        return { content: this.toCSV(data), url: `data:application/vnd.ms-excel;base64,${Buffer.from(this.toCSV(data)).toString("base64")}` };
      case "PDF":
        // Real impl would use pdfkit or puppeteer — for now return JSON
        return { content: JSON.stringify(data, null, 2), url: `data:application/pdf;base64,${Buffer.from(JSON.stringify(data)).toString("base64")}` };
      default:
        return { content: JSON.stringify(data), url: "" };
    }
  }

  private toCSV(data: unknown[]): string {
    if (!data.length) return "";
    const first = data[0] as Record<string, unknown>;
    const headers = Object.keys(first);
    const rows = data.map((row) => {
      const r = row as Record<string, unknown>;
      return headers.map((h) => {
        const val = r[h];
        if (val === null || val === undefined) return "";
        if (val instanceof Date) return val.toISOString();
        if (typeof val === "object") return JSON.stringify(val);
        return String(val);
      }).join(",");
    });
    return [headers.join(","), ...rows].join("\n");
  }

  private calculateNextRun(cronExpression: string): Date {
    // Simplified — real impl would use cron-parser
    void cronExpression;
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
}
