import { AuditLogsService } from "./audit-logs.service";
import { type ListAuditLogsQueryDto } from "./dto/audit-log.dto";
export declare class AuditLogsController {
    private readonly audit;
    constructor(audit: AuditLogsService);
    findAll(query: ListAuditLogsQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
        id: string;
        organizationId: string | null;
        status: import(".prisma/client").$Enums.AuditStatus;
        location: string | null;
        createdAt: Date;
        metadata: import(".prisma/client/runtime/library").JsonValue;
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
