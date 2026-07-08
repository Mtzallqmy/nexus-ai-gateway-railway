import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { CreateOrgDto, ListOrgsQueryDto, UpdateOrgDto } from "./dto/org.dto";
export declare class OrganizationsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(dto: CreateOrgDto, ownerId: string): Promise<{
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        description: string | null;
        logoUrl: string | null;
        plan: string;
        orgSettings: Prisma.JsonValue;
        ownerId: string;
    }>;
    findAll(query: ListOrgsQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        description: string | null;
        logoUrl: string | null;
        plan: string;
        orgSettings: Prisma.JsonValue;
        ownerId: string;
    }>>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        description: string | null;
        logoUrl: string | null;
        plan: string;
        orgSettings: Prisma.JsonValue;
        ownerId: string;
    }>;
    findBySlug(slug: string): Promise<{
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        description: string | null;
        logoUrl: string | null;
        plan: string;
        orgSettings: Prisma.JsonValue;
        ownerId: string;
    } | null>;
    update(id: string, dto: UpdateOrgDto): Promise<{
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.OrganizationStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        description: string | null;
        logoUrl: string | null;
        plan: string;
        orgSettings: Prisma.JsonValue;
        ownerId: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    private slugify;
    private uniqueSlug;
}
