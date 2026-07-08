import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { ListSessionsQueryDto } from "./dto/session.dto";
export declare class SessionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: ListSessionsQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
        id: string;
        status: import(".prisma/client").$Enums.SessionStatus;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        expiresAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
        deviceName: string | null;
        lastUsedAt: Date | null;
    }>>;
    findOne(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SessionStatus;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tokenHash: string;
        expiresAt: Date;
        revokedAt: Date | null;
        revokedReason: string | null;
        refreshTokenHash: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        deviceName: string | null;
        lastUsedAt: Date | null;
    }>;
    revoke(id: string, reason?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SessionStatus;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tokenHash: string;
        expiresAt: Date;
        revokedAt: Date | null;
        revokedReason: string | null;
        refreshTokenHash: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        deviceName: string | null;
        lastUsedAt: Date | null;
    }>;
    revokeAllForUser(userId: string, exceptId?: string): Promise<{
        count: number;
    }>;
}
