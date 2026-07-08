import { SettingsService } from "./settings.service";
import { type ListSettingsQueryDto, type UpsertSettingDto } from "./dto/setting.dto";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
export declare class SettingsController {
    private readonly settings;
    constructor(settings: SettingsService);
    findAll(query: ListSettingsQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
        isPublic: boolean;
        type: import(".prisma/client").$Enums.ConfigType;
        id: string;
        organizationId: string | null;
        value: import(".prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        key: string;
        updatedById: string | null;
    }>>;
    findByKey(key: string): Promise<{
        isPublic: boolean;
        type: import(".prisma/client").$Enums.ConfigType;
        id: string;
        organizationId: string | null;
        value: import(".prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        key: string;
        updatedById: string | null;
    }>;
    upsert(dto: UpsertSettingDto, user: AuthenticatedUser): Promise<{
        isPublic: boolean;
        type: import(".prisma/client").$Enums.ConfigType;
        id: string;
        organizationId: string | null;
        value: import(".prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        key: string;
        updatedById: string | null;
    }>;
    remove(key: string): Promise<{
        message: string;
    }>;
}
