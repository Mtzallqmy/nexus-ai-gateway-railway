import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { ListAuditLogsQueryDto } from "./dto/audit-log.dto";
export interface AuditContext {
    actorId?: string;
    actorEmail: string;
    action: string;
    status: "SUCCESS" | "FAILURE";
    resource: string;
    resourceId?: string;
    resourceName?: string;
    organizationId?: string;
    projectId?: string;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    metadata?: Record<string, unknown>;
    errorMessage?: string;
}
export declare class AuditLogsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    record(ctx: AuditContext): Promise<void>;
    findAll(query: ListAuditLogsQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
        id: string;
        organizationId: string | null;
        status: import(".prisma/client").$Enums.AuditStatus;
        location: string | null;
        createdAt: Date;
        metadata: Prisma.JsonValue;
        resource: string;
        ipAddress: string | null;
        userAgent: string | null;
        projectId: string | null;
        actorEmail: string;
        action: import(".prisma/client").$Enums.AuditAction;
        resourceId: string | null;
        resourceName: string | null;
        errorMessage: string | null;
        actorId: string | null;
    }>>;
}
