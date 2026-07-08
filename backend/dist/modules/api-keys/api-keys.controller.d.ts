import { ApiKeysService } from "./api-keys.service";
import { type CreateApiKeyDto, type ListApiKeysQueryDto } from "./dto/api-key.dto";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
export declare class ApiKeysController {
    private readonly keys;
    constructor(keys: ApiKeysService);
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
    create(dto: CreateApiKeyDto, user: AuthenticatedUser): Promise<{
        id: string;
        key: string;
        maskedKey: string;
        name: string;
        scopes: string[];
        expiresAt: string | null;
        createdAt: string;
    }>;
    rotate(id: string, user: AuthenticatedUser): Promise<{
        id: string;
        key: string;
        maskedKey: string;
        message: string;
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
    remove(id: string): Promise<{
        message: string;
    }>;
}
