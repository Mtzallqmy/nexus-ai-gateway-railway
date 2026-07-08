import { CostTrackingService } from "./cost-tracking.service";
export declare class CostTrackingController {
    private readonly costs;
    constructor(costs: CostTrackingService);
    byProvider(startDate?: string, endDate?: string): Promise<{
        provider: string;
        cost: number;
        estimatedCost: number;
        realCost: number;
        requests: number;
        tokens: number;
    }[]>;
    byUser(orgId?: string, startDate?: string, endDate?: string): Promise<{
        userId: string | null;
        cost: number;
        estimatedCost: number;
        realCost: number;
        requests: number;
        tokens: number;
    }[]>;
    byOrganization(startDate?: string, endDate?: string): Promise<{
        organizationId: string | null;
        cost: number;
        estimatedCost: number;
        realCost: number;
        requests: number;
        tokens: number;
    }[]>;
    byModel(startDate?: string, endDate?: string): Promise<{
        model: string;
        provider: string;
        cost: number;
        estimatedCost: number;
        realCost: number;
        requests: number;
        tokens: number;
    }[]>;
    daily(orgId?: string, days?: string): Promise<{
        cost: number;
        estimated: number;
        real: number;
        date: string;
    }[]>;
    monthly(orgId?: string, months?: string): Promise<{
        cost: number;
        estimated: number;
        real: number;
        month: string;
    }[]>;
    total(orgId?: string): Promise<{
        totalCost: number;
        totalEstimated: number;
        totalReal: number;
    }>;
}
