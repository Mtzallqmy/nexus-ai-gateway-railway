import { AlertsService, type CreateAlertRuleDto } from "./alerts.service";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
export declare class AlertsController {
    private readonly alerts;
    constructor(alerts: AlertsService);
    getAlerts(status?: string, severity?: string, limit?: string): Promise<{
        message: string;
        type: string;
        name: string;
        id: string;
        notifications: import(".prisma/client/runtime/library").JsonValue;
        status: import(".prisma/client").$Enums.AlertStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        metadata: import(".prisma/client/runtime/library").JsonValue;
        resourceId: string | null;
        resourceName: string | null;
        severity: import(".prisma/client").$Enums.AlertSeverity;
        source: string;
        currentValue: string | null;
        threshold: string | null;
        acknowledgedBy: string | null;
        acknowledgedAt: Date | null;
        resolvedAt: Date | null;
        resolvedBy: string | null;
        resolvedReason: string | null;
        triggeredAt: Date;
    }[]>;
    getRules(includeDisabled?: string): Promise<{
        type: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        metadata: import(".prisma/client/runtime/library").JsonValue;
        actions: import(".prisma/client/runtime/library").JsonValue;
        isEnabled: boolean;
        severity: import(".prisma/client").$Enums.AlertSeverity;
        threshold: number;
        metric: string;
        condition: string;
        windowMinutes: number;
        cooldownMinutes: number;
        lastTriggeredAt: Date | null;
        triggerCount: number;
    }[]>;
    createRule(dto: CreateAlertRuleDto): Promise<{
        type: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        metadata: import(".prisma/client/runtime/library").JsonValue;
        actions: import(".prisma/client/runtime/library").JsonValue;
        isEnabled: boolean;
        severity: import(".prisma/client").$Enums.AlertSeverity;
        threshold: number;
        metric: string;
        condition: string;
        windowMinutes: number;
        cooldownMinutes: number;
        lastTriggeredAt: Date | null;
        triggerCount: number;
    }>;
    updateRule(id: string, dto: Partial<CreateAlertRuleDto>): Promise<{
        type: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        metadata: import(".prisma/client/runtime/library").JsonValue;
        actions: import(".prisma/client/runtime/library").JsonValue;
        isEnabled: boolean;
        severity: import(".prisma/client").$Enums.AlertSeverity;
        threshold: number;
        metric: string;
        condition: string;
        windowMinutes: number;
        cooldownMinutes: number;
        lastTriggeredAt: Date | null;
        triggerCount: number;
    }>;
    deleteRule(id: string): Promise<{
        message: string;
    }>;
    acknowledge(id: string, user: AuthenticatedUser): Promise<{
        message: string;
    }>;
    resolve(id: string, user: AuthenticatedUser, reason?: string): Promise<{
        message: string;
    }>;
    evaluate(): Promise<{
        evaluated: number;
        triggered: number;
    }>;
}
