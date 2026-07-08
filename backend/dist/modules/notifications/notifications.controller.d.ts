import { NotificationsService } from "./notifications.service";
import { type CreateNotificationDto, type ListNotificationsQueryDto } from "./dto/notification.dto";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
export declare class NotificationsController {
    private readonly notifs;
    constructor(notifs: NotificationsService);
    findAll(query: ListNotificationsQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponse<{
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        id: string;
        createdAt: Date;
        title: string;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        category: string;
        read: boolean;
        readAt: Date | null;
        actionUrl: string | null;
        actionLabel: string | null;
        metadata: import(".prisma/client/runtime/library").JsonValue;
        scheduledFor: Date | null;
        sentAt: Date | null;
        userId: string;
    }>>;
    unreadCount(user: AuthenticatedUser): Promise<{
        count: number;
    }>;
    findOne(_id: string): Promise<{
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        id: string;
        createdAt: Date;
        title: string;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        category: string;
        read: boolean;
        readAt: Date | null;
        actionUrl: string | null;
        actionLabel: string | null;
        metadata: import(".prisma/client/runtime/library").JsonValue;
        scheduledFor: Date | null;
        sentAt: Date | null;
        userId: string;
    }>;
    create(dto: CreateNotificationDto): Promise<{
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        id: string;
        createdAt: Date;
        title: string;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        category: string;
        read: boolean;
        readAt: Date | null;
        actionUrl: string | null;
        actionLabel: string | null;
        metadata: import(".prisma/client/runtime/library").JsonValue;
        scheduledFor: Date | null;
        sentAt: Date | null;
        userId: string;
    }>;
    markRead(id: string): Promise<{
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        id: string;
        createdAt: Date;
        title: string;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        category: string;
        read: boolean;
        readAt: Date | null;
        actionUrl: string | null;
        actionLabel: string | null;
        metadata: import(".prisma/client/runtime/library").JsonValue;
        scheduledFor: Date | null;
        sentAt: Date | null;
        userId: string;
    }>;
    markAllRead(user: AuthenticatedUser): Promise<{
        count: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
