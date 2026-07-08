import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { CreateApiKeyDto, ListApiKeysQueryDto } from "./dto/api-key.dto";
export declare class ApiKeysService {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    private readonly prefix;
    private readonly keyLength;
    constructor(prisma: PrismaService, config: ConfigService);
    create(dto: CreateApiKeyDto, userId: string): Promise<{
        id: string;
        key: string;
        maskedKey: string;
        name: string;
        scopes: string[];
        expiresAt: string | null;
        createdAt: string;
    }>;
    findAll(query: ListApiKeysQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
        usageLimit: string | null;
        usageCount: string;
        user: {
            name: string;
            id: string;
            email: string;
        };
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.ApiKeyStatus;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date | null;
        revokedAt: Date | null;
        lastUsedAt: Date | null;
        keyPrefix: string;
        maskedKey: string;
        scopes: string[];
        rateLimitRps: number | null;
    }>>;
    findOne(id: string): Promise<{
        usageLimit: string | null;
        usageCount: string;
        name: string;
        id: string;
        organizationId: string | null;
        status: import(".prisma/client").$Enums.ApiKeyStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        expiresAt: Date | null;
        revokedAt: Date | null;
        revokedReason: string | null;
        createdBy: string;
        lastUsedAt: Date | null;
        keyPrefix: string;
        keyHash: string;
        maskedKey: string;
        scopes: string[];
        rateLimitRps: number | null;
        projectId: string | null;
    }>;
    revoke(id: string, reason?: string): Promise<{
        usageLimit: bigint | null;
        name: string;
        id: string;
        organizationId: string | null;
        status: import(".prisma/client").$Enums.ApiKeyStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        expiresAt: Date | null;
        revokedAt: Date | null;
        revokedReason: string | null;
        createdBy: string;
        lastUsedAt: Date | null;
        keyPrefix: string;
        keyHash: string;
        maskedKey: string;
        scopes: string[];
        usageCount: bigint;
        rateLimitRps: number | null;
        projectId: string | null;
    }>;
    rotate(id: string, userId: string): Promise<{
        id: string;
        key: string;
        maskedKey: string;
        message: string;
    }>;
    recordUsage(id: string): Promise<void>;
    validate(rawKey: string): Promise<({
        user: {
            name: string;
            id: string;
            email: string;
        };
    } & {
        usageLimit: bigint | null;
        name: string;
        id: string;
        organizationId: string | null;
        status: import(".prisma/client").$Enums.ApiKeyStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        expiresAt: Date | null;
        revokedAt: Date | null;
        revokedReason: string | null;
        createdBy: string;
        lastUsedAt: Date | null;
        keyPrefix: string;
        keyHash: string;
        maskedKey: string;
        scopes: string[];
        usageCount: bigint;
        rateLimitRps: number | null;
        projectId: string | null;
    }) | null>;
    remove(id: string): Promise<{
        message: string;
    }>;
    private generateRawKey;
    private hashKey;
}
