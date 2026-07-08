import { AdminService, type AdminCategory } from "./admin.service";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
export declare class AdminController {
    private readonly admin;
    constructor(admin: AdminService);
    getSettings(category?: AdminCategory, publicOnly?: string): Promise<{
        isPublic: boolean;
        type: import(".prisma/client").$Enums.ConfigType;
        id: string;
        value: import(".prisma/client/runtime/library").JsonValue;
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
        value: import(".prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        key: string;
        updatedById: string | null;
        isEncrypted: boolean;
        isReadOnly: boolean;
    }>;
    setSetting(body: {
        key: string;
        value: unknown;
    }, user: AuthenticatedUser): Promise<{
        message: string;
    }>;
    deleteSetting(key: string): Promise<{
        message: string;
    }>;
    overview(): Promise<{
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
