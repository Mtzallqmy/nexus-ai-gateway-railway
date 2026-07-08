import { PermissionsService } from "./permissions.service";
import { type CreatePermissionDto, type ListPermissionsQueryDto } from "./dto/permission.dto";
export declare class PermissionsController {
    private readonly perms;
    constructor(perms: PermissionsService);
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
    grant(body: {
        userId: string;
        permissionId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        permissionId: string;
        granted: boolean;
        conditions: import(".prisma/client/runtime/library").JsonValue;
        createdBy: string | null;
    }>;
    revoke(body: {
        userId: string;
        permissionId: string;
    }): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
