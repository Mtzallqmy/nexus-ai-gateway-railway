import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { CreatePermissionDto, ListPermissionsQueryDto } from "./dto/permission.dto";
export declare class PermissionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreatePermissionDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        resource: string;
        actions: string[];
        group: string;
        isSystem: boolean;
    }>;
    findAll(query: ListPermissionsQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        resource: string;
        actions: string[];
        group: string;
        isSystem: boolean;
    }>>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        resource: string;
        actions: string[];
        group: string;
        isSystem: boolean;
    }>;
    findBySlug(slug: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        resource: string;
        actions: string[];
        group: string;
        isSystem: boolean;
    } | null>;
    grouped(): Promise<Record<string, {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        resource: string;
        actions: string[];
        group: string;
        isSystem: boolean;
    }[]>>;
    grantToUser(userId: string, permissionId: string, grantedBy?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        permissionId: string;
        granted: boolean;
        conditions: Prisma.JsonValue;
        createdBy: string | null;
    }>;
    revokeFromUser(userId: string, permissionId: string): Promise<Prisma.BatchPayload>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
