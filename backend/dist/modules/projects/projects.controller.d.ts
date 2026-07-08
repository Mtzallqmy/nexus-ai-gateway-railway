import { ProjectsService } from "./projects.service";
import { type CreateProjectDto, type ListProjectsQueryDto, type UpdateProjectDto } from "./dto/project.dto";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
export declare class ProjectsController {
    private readonly projects;
    constructor(projects: ProjectsService);
    findAll(query: ListProjectsQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
        name: string;
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.ProjectStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        description: string | null;
        ownerId: string;
        metadata: import(".prisma/client/runtime/library").JsonValue;
        teamId: string | null;
    }>>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.ProjectStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        description: string | null;
        ownerId: string;
        metadata: import(".prisma/client/runtime/library").JsonValue;
        teamId: string | null;
    }>;
    create(dto: CreateProjectDto, user: AuthenticatedUser): Promise<{
        name: string;
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.ProjectStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        description: string | null;
        ownerId: string;
        metadata: import(".prisma/client/runtime/library").JsonValue;
        teamId: string | null;
    }>;
    update(id: string, dto: UpdateProjectDto): Promise<{
        name: string;
        id: string;
        organizationId: string;
        status: import(".prisma/client").$Enums.ProjectStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        description: string | null;
        ownerId: string;
        metadata: import(".prisma/client/runtime/library").JsonValue;
        teamId: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
