import { OrganizationsService } from "./organizations.service";
import { type CreateOrgDto, type ListOrgsQueryDto, type UpdateOrgDto } from "./dto/org.dto";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
export declare class OrganizationsController {
    private readonly orgs;
    constructor(orgs: OrganizationsService);
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
        orgSettings: import(".prisma/client/runtime/library").JsonValue;
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
        orgSettings: import(".prisma/client/runtime/library").JsonValue;
        ownerId: string;
    }>;
    create(dto: CreateOrgDto, user: AuthenticatedUser): Promise<{
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
        orgSettings: import(".prisma/client/runtime/library").JsonValue;
        ownerId: string;
    }>;
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
        orgSettings: import(".prisma/client/runtime/library").JsonValue;
        ownerId: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
