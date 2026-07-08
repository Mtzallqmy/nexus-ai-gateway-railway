import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { CreateProjectDto, ListProjectsQueryDto, UpdateProjectDto } from "./dto/project.dto";
export declare class ProjectsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateProjectDto, ownerId: string): Promise<{
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
        metadata: Prisma.JsonValue;
        teamId: string | null;
    }>;
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
        metadata: Prisma.JsonValue;
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
        metadata: Prisma.JsonValue;
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
        metadata: Prisma.JsonValue;
        teamId: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    private slugify;
}
