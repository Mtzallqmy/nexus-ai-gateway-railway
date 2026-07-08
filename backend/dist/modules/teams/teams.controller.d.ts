import { TeamsService } from "./teams.service";
import { type CreateTeamDto, type ListTeamsQueryDto, type UpdateTeamDto } from "./dto/team.dto";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
export declare class TeamsController {
    private readonly teams;
    constructor(teams: TeamsService);
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
    create(dto: CreateTeamDto, user: AuthenticatedUser): Promise<{
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
}
