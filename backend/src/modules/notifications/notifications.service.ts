import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { CreateNotificationDto, ListNotificationsQueryDto } from "./dto/notification.dto";
import { buildPagination } from "../../common/dto/pagination.dto";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
        type: dto.type,
        channel: dto.channel,
        category: dto.category,
        actionUrl: dto.actionUrl,
        actionLabel: dto.actionLabel,
        metadata: (dto.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
      },
    });
  }

  async findAll(query: ListNotificationsQueryDto) {
    const where: Prisma.NotificationWhereInput = {};
    if (query.userId) where.userId = query.userId;
    if (query.read !== undefined) where.read = query.read;
    if (query.category) where.category = query.category;
    if (query.type) where.type = query.type;
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.notification.count({ where }),
    ]);
    return buildPagination(items, total, query);
  }

  async markRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    const r = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
    return { count: r.count };
  }

  async remove(id: string) {
    await this.prisma.notification.delete({ where: { id } });
    return { message: "Notification deleted" };
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });
    return { count };
  }
}
