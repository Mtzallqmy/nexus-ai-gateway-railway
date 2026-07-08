import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { CreateNotificationDto, ListNotificationsQueryDto } from "./dto/notification.dto";
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
        metadata: Prisma.JsonValue;
        scheduledFor: Date | null;
        sentAt: Date | null;
        userId: string;
    }>;
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
        metadata: Prisma.JsonValue;
        scheduledFor: Date | null;
        sentAt: Date | null;
        userId: string;
    }>>;
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
        metadata: Prisma.JsonValue;
        scheduledFor: Date | null;
        sentAt: Date | null;
        userId: string;
    }>;
    markAllRead(userId: string): Promise<{
        count: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    unreadCount(userId: string): Promise<{
        count: number;
    }>;
}
