import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { z } from "zod";
export declare const createReportSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]>;
    format: z.ZodDefault<z.ZodEnum<["CSV", "EXCEL", "PDF", "JSON"]>>;
    organizationId: z.ZodOptional<z.ZodString>;
    periodStart: z.ZodString;
    periodEnd: z.ZodString;
    filters: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    type: "CUSTOM" | "MONTHLY" | "DAILY" | "WEEKLY";
    name: string;
    format: "JSON" | "CSV" | "EXCEL" | "PDF";
    periodStart: string;
    periodEnd: string;
    filters: Record<string, unknown>;
    organizationId?: string | undefined;
}, {
    type: "CUSTOM" | "MONTHLY" | "DAILY" | "WEEKLY";
    name: string;
    periodStart: string;
    periodEnd: string;
    format?: "JSON" | "CSV" | "EXCEL" | "PDF" | undefined;
    organizationId?: string | undefined;
    filters?: Record<string, unknown> | undefined;
}>;
export type CreateReportDto = z.infer<typeof createReportSchema>;
export declare class ReportingService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createReport(dto: CreateReportDto, userId: string): Promise<{
        reportId: string;
        status: string;
        format: "JSON" | "CSV" | "EXCEL" | "PDF";
        data: string;
        rowCount: number;
    }>;
    getReports(organizationId?: string, limit?: number): Promise<{
        type: import(".prisma/client").$Enums.ReportType;
        name: string;
        id: string;
        format: import(".prisma/client").$Enums.ReportFormat;
        organizationId: string | null;
        status: import(".prisma/client").$Enums.ReportStatus;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date | null;
        errorMessage: string | null;
        periodStart: Date;
        periodEnd: Date;
        filters: Prisma.JsonValue;
        requestedBy: string;
        fileUrl: string | null;
        fileSize: bigint;
        rowCount: number;
        generatedAt: Date | null;
    }[]>;
    getReport(id: string): Promise<{
        type: import(".prisma/client").$Enums.ReportType;
        name: string;
        id: string;
        format: import(".prisma/client").$Enums.ReportFormat;
        organizationId: string | null;
        status: import(".prisma/client").$Enums.ReportStatus;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date | null;
        errorMessage: string | null;
        periodStart: Date;
        periodEnd: Date;
        filters: Prisma.JsonValue;
        requestedBy: string;
        fileUrl: string | null;
        fileSize: bigint;
        rowCount: number;
        generatedAt: Date | null;
    } | null>;
    getScheduledReports(organizationId?: string): Promise<{
        type: import(".prisma/client").$Enums.ReportType;
        isActive: boolean;
        name: string;
        id: string;
        format: import(".prisma/client").$Enums.ReportFormat;
        organizationId: string | null;
        createdAt: Date;
        updatedAt: Date;
        filters: Prisma.JsonValue;
        recipientEmails: string[];
        cronExpression: string;
        lastRunAt: Date | null;
        nextRunAt: Date | null;
    }[]>;
    createScheduledReport(dto: {
        name: string;
        type: "DAILY" | "WEEKLY" | "MONTHLY";
        format: "CSV" | "EXCEL" | "PDF" | "JSON";
        organizationId?: string;
        recipientEmails: string[];
        cronExpression: string;
        filters?: Record<string, unknown>;
    }): Promise<{
        type: import(".prisma/client").$Enums.ReportType;
        isActive: boolean;
        name: string;
        id: string;
        format: import(".prisma/client").$Enums.ReportFormat;
        organizationId: string | null;
        createdAt: Date;
        updatedAt: Date;
        filters: Prisma.JsonValue;
        recipientEmails: string[];
        cronExpression: string;
        lastRunAt: Date | null;
        nextRunAt: Date | null;
    }>;
    deleteScheduledReport(id: string): Promise<{
        message: string;
    }>;
    private collectReportData;
    private formatExport;
    private toCSV;
    private calculateNextRun;
}
