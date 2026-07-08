import { ReportingService, type CreateReportDto } from "./reporting.service";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
export declare class ReportingController {
    private readonly reporting;
    constructor(reporting: ReportingService);
    generate(dto: CreateReportDto, user: AuthenticatedUser): Promise<{
        reportId: string;
        status: string;
        format: "JSON" | "CSV" | "EXCEL" | "PDF";
        data: string;
        rowCount: number;
    }>;
    getReports(orgId?: string, limit?: string): Promise<{
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
        filters: import(".prisma/client/runtime/library").JsonValue;
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
        filters: import(".prisma/client/runtime/library").JsonValue;
        requestedBy: string;
        fileUrl: string | null;
        fileSize: bigint;
        rowCount: number;
        generatedAt: Date | null;
    } | null>;
    getScheduled(orgId?: string): Promise<{
        type: import(".prisma/client").$Enums.ReportType;
        isActive: boolean;
        name: string;
        id: string;
        format: import(".prisma/client").$Enums.ReportFormat;
        organizationId: string | null;
        createdAt: Date;
        updatedAt: Date;
        filters: import(".prisma/client/runtime/library").JsonValue;
        recipientEmails: string[];
        cronExpression: string;
        lastRunAt: Date | null;
        nextRunAt: Date | null;
    }[]>;
    createScheduled(body: {
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
        filters: import(".prisma/client/runtime/library").JsonValue;
        recipientEmails: string[];
        cronExpression: string;
        lastRunAt: Date | null;
        nextRunAt: Date | null;
    }>;
    deleteScheduled(id: string): Promise<{
        message: string;
    }>;
}
