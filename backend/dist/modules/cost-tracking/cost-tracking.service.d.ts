import { PrismaService } from "../../infrastructure/prisma/prisma.service";
export declare class CostTrackingService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getCostByProvider(startDate?: Date, endDate?: Date): Promise<{
        provider: string;
        cost: number;
        estimatedCost: number;
        realCost: number;
        requests: number;
        tokens: number;
    }[]>;
    getCostByUser(organizationId?: string, startDate?: Date, endDate?: Date): Promise<{
        userId: string | null;
        cost: number;
        estimatedCost: number;
        realCost: number;
        requests: number;
        tokens: number;
    }[]>;
    getCostByOrganization(startDate?: Date, endDate?: Date): Promise<{
        organizationId: string | null;
        cost: number;
        estimatedCost: number;
        realCost: number;
        requests: number;
        tokens: number;
    }[]>;
    getCostByModel(startDate?: Date, endDate?: Date): Promise<{
        model: string;
        provider: string;
        cost: number;
        estimatedCost: number;
        realCost: number;
        requests: number;
        tokens: number;
    }[]>;
    getDailyCost(organizationId?: string, days?: number): Promise<{
        cost: number;
        estimated: number;
        real: number;
        date: string;
    }[]>;
    getMonthlyCost(organizationId?: string, months?: number): Promise<{
        cost: number;
        estimated: number;
        real: number;
        month: string;
    }[]>;
    getTotalCost(organizationId?: string): Promise<{
        totalCost: number;
        totalEstimated: number;
        totalReal: number;
    }>;
}
