"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
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
                metadata: dto.metadata ?? client_1.Prisma.JsonNull,
                scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
            },
        });
    }
    async findAll(query) {
        const where = {};
        if (query.userId)
            where.userId = query.userId;
        if (query.read !== undefined)
            where.read = query.read;
        if (query.category)
            where.category = query.category;
        if (query.type)
            where.type = query.type;
        const [items, total] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (query.page - 1) * query.pageSize,
                take: query.pageSize,
            }),
            this.prisma.notification.count({ where }),
        ]);
        return (0, pagination_dto_1.buildPagination)(items, total, query);
    }
    async markRead(id) {
        return this.prisma.notification.update({
            where: { id },
            data: { read: true, readAt: new Date() },
        });
    }
    async markAllRead(userId) {
        const r = await this.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true, readAt: new Date() },
        });
        return { count: r.count };
    }
    async remove(id) {
        await this.prisma.notification.delete({ where: { id } });
        return { message: "Notification deleted" };
    }
    async unreadCount(userId) {
        const count = await this.prisma.notification.count({
            where: { userId, read: false },
        });
        return { count };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map