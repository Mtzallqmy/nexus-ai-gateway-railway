import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
export declare class SecurityService {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    private readonly encryptionKey;
    constructor(prisma: PrismaService, config: ConfigService);
    storeSecret(key: string, value: string, description?: string, category?: string, createdBy?: string): Promise<void>;
    getSecret(key: string): Promise<string>;
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
    deleteSecret(key: string): Promise<void>;
    rotateSecret(key: string, newValue: string): Promise<void>;
    getAuditTrail(filter: {
        actorId?: string;
        action?: string;
        resource?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }): Promise<{
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
    }[]>;
    checkAccess(userId: string, resource: string, action: string): Promise<{
        allowed: boolean;
        reason?: string;
    }>;
    enforceAccess(userId: string, resource: string, action: string): Promise<void>;
    private encrypt;
    private decrypt;
}
