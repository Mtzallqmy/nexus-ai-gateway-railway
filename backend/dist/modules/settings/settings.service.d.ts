import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { ListSettingsQueryDto, UpsertSettingDto } from "./dto/setting.dto";
export declare class SettingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    upsert(dto: UpsertSettingDto, updatedById: string): Promise<{
        isPublic: boolean;
        type: import(".prisma/client").$Enums.ConfigType;
        id: string;
        organizationId: string | null;
        value: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        key: string;
        updatedById: string | null;
    }>;
    findAll(query: ListSettingsQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
        isPublic: boolean;
        type: import(".prisma/client").$Enums.ConfigType;
        id: string;
        organizationId: string | null;
        value: Prisma.JsonValue;
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
        value: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        key: string;
        updatedById: string | null;
    }>;
    getValue<T = unknown>(key: string, defaultValue?: T): Promise<T | undefined>;
    remove(key: string): Promise<{
        message: string;
    }>;
}
