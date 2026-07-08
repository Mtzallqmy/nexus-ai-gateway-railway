import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { CreateTeamDto, ListTeamsQueryDto, UpdateTeamDto } from "./dto/team.dto";
export declare class TeamsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateTeamDto, ownerId: string): Promise<{
        name: string;
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.TeamStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        description: string | null;
        ownerId: string;
    }>;
    findAll(query: ListTeamsQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
        name: string;
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.TeamStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        description: string | null;
        ownerId: string;
    }>>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.TeamStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        description: string | null;
        ownerId: string;
    }>;
    update(id: string, dto: UpdateTeamDto): Promise<{
        name: string;
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.TeamStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        description: string | null;
        ownerId: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    private slugify;
}
