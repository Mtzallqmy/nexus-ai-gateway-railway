import { UsageService } from "./usage.service";
export declare class UsageController {
    private readonly usage;
    constructor(usage: UsageService);
    summary(query: {
        organizationId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        records: number;
        requests: number;
        responses: number;
        inputTokens: number;
        outputTokens: number;
        cachedTokens: number;
        totalTokens: number;
        streamingSessions: number;
        images: number;
        embeddings: number;
        speech: number;
        vision: number;
        moderation: number;
        cost: import(".prisma/client/runtime/library").Decimal;
        errors: number;
        successes: number;
    }>;
    byType(query: {
        organizationId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        streaming: number;
        images: number;
        embeddings: number;
        speech: number;
        vision: number;
        moderation: number;
    }>;
}
