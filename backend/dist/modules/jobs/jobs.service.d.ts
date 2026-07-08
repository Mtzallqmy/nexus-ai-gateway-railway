import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { AnalyticsService } from "../analytics/analytics.service";
export declare class JobsService {
    private readonly prisma;
    private readonly analytics;
    private readonly logger;
    constructor(prisma: PrismaService, analytics: AnalyticsService);
    executeJob(type: string, triggeredBy?: string): Promise<{
        jobId: string;
        status: string;
        durationMs: number;
        result: unknown;
    }>;
    private runJob;
    private runCleanup;
    private runStatistics;
    private runAggregation;
    private runSynchronization;
    private runHealthCheck;
    private runCostCalculation;
    private runUsageCalculation;
    getJobHistory(type?: string, limit?: number): Promise<{
        type: import(".prisma/client").$Enums.JobType;
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.JobStatus;
        createdAt: Date;
        updatedAt: Date;
        result: Prisma.JsonValue;
        errorMessage: string | null;
        startedAt: Date | null;
        completedAt: Date | null;
        durationMs: number;
        triggeredBy: string;
        payload: Prisma.JsonValue;
        retryCount: number;
        maxRetries: number;
    }[]>;
    private getJobName;
}
