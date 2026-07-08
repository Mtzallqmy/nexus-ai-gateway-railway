import { SessionsService } from "./sessions.service";
import { type ListSessionsQueryDto } from "./dto/session.dto";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
export declare class SessionsController {
    private readonly sessions;
    constructor(sessions: SessionsService);
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
    revokeAllMine(user: AuthenticatedUser): Promise<{
        count: number;
    }>;
}
