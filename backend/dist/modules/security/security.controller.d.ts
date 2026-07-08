import { SecurityService } from "./security.service";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
export declare class SecurityController {
    private readonly security;
    constructor(security: SecurityService);
    getSecrets(category?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        key: string;
        rotatedAt: Date | null;
        rotateAfterDays: number | null;
    }[]>;
    storeSecret(body: {
        key: string;
        value: string;
        description?: string;
        category?: string;
    }, user: AuthenticatedUser): Promise<{
        message: string;
    }>;
    getSecret(key: string): Promise<{
        key: string;
        value: string;
    }>;
    rotateSecret(key: string, value: string): Promise<{
        message: string;
    }>;
    deleteSecret(key: string): Promise<{
        message: string;
    }>;
    auditTrail(actorId?: string, action?: string, resource?: string, startDate?: string, endDate?: string, limit?: string): Promise<{
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
    }[]>;
    checkAccess(body: {
        userId: string;
        resource: string;
        action: string;
    }): Promise<{
        allowed: boolean;
        reason?: string;
    }>;
}
