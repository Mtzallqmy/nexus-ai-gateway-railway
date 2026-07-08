import { JobsService } from "./jobs.service";
export declare class JobsController {
    private readonly jobs;
    constructor(jobs: JobsService);
    execute(type: string): Promise<{
        jobId: string;
        status: string;
        durationMs: number;
        result: unknown;
    }>;
    history(type?: string, limit?: string): Promise<{
        type: import(".prisma/client").$Enums.JobType;
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.JobStatus;
        createdAt: Date;
        updatedAt: Date;
        result: import(".prisma/client/runtime/library").JsonValue;
        errorMessage: string | null;
        startedAt: Date | null;
        completedAt: Date | null;
        durationMs: number;
        triggeredBy: string;
        payload: import(".prisma/client/runtime/library").JsonValue;
        retryCount: number;
        maxRetries: number;
    }[]>;
}
