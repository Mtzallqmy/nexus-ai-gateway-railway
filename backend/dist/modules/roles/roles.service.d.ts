import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { CreateRoleDto, ListRolesQueryDto, UpdateRoleDto } from "./dto/role.dto";
export declare class RolesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateRoleDto): Promise<{
        name: string;
        id: string;
        permissions: Prisma.JsonValue;
        organizationId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        description: string | null;
        isSystem: boolean;
        color: string | null;
        isDefault: boolean;
    }>;
    findAll(query: ListRolesQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
        rolePermissions: ({
            permission: {
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
            };
        } & {
            id: string;
            createdAt: Date;
            permissionId: string;
            conditions: Prisma.JsonValue;
            roleId: string;
        })[];
    } & {
        name: string;
        id: string;
        permissions: Prisma.JsonValue;
        organizationId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        description: string | null;
        isSystem: boolean;
        color: string | null;
        isDefault: boolean;
    }>>;
    findOne(id: string): Promise<{
        rolePermissions: ({
            permission: {
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
            };
        } & {
            id: string;
            createdAt: Date;
            permissionId: string;
            conditions: Prisma.JsonValue;
            roleId: string;
        })[];
    } & {
        name: string;
        id: string;
        permissions: Prisma.JsonValue;
        organizationId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        description: string | null;
        isSystem: boolean;
        color: string | null;
        isDefault: boolean;
    }>;
    update(id: string, dto: UpdateRoleDto): Promise<{
        name: string;
        id: string;
        permissions: Prisma.JsonValue;
        organizationId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        description: string | null;
        isSystem: boolean;
        color: string | null;
        isDefault: boolean;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    private slugify;
}
