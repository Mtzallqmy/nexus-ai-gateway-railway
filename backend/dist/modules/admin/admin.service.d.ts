import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
export type AdminCategory = "system" | "provider" | "billing" | "monitoring" | "notification";
export declare class AdminService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private seedDefaults;
    getSettings(category?: AdminCategory, publicOnly?: boolean): Promise<{
        isPublic: boolean;
        type: import(".prisma/client").$Enums.ConfigType;
        id: string;
        value: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        key: string;
        updatedById: string | null;
        isEncrypted: boolean;
        isReadOnly: boolean;
    }[]>;
    getSetting(key: string): Promise<{
        isPublic: boolean;
        type: import(".prisma/client").$Enums.ConfigType;
        id: string;
        value: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        key: string;
        updatedById: string | null;
        isEncrypted: boolean;
        isReadOnly: boolean;
    }>;
    getSettingValue<T = unknown>(key: string, defaultValue?: T): Promise<T | undefined>;
    setSetting(key: string, value: unknown, updatedBy?: string): Promise<void>;
    deleteSetting(key: string): Promise<void>;
    getSystemOverview(): Promise<{
        timestamp: string;
        stats: {
            settings: number;
            users: number;
            orgs: number;
            activeSubscriptions: number;
            activeAlerts: number;
            readyReports: number;
        };
    }>;
}
