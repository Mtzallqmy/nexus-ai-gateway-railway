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
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let SessionsService = class SessionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const where = {};
        if (query.userId)
            where.userId = query.userId;
        if (query.status)
            where.status = query.status;
        const [items, total] = await Promise.all([
            this.prisma.session.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (query.page - 1) * query.pageSize,
                take: query.pageSize,
                select: {
                    id: true,
                    userId: true,
                    status: true,
                    ipAddress: true,
                    userAgent: true,
                    deviceName: true,
                    location: true,
                    expiresAt: true,
                    lastUsedAt: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            this.prisma.session.count({ where }),
        ]);
        return (0, pagination_dto_1.buildPagination)(items, total, query);
    }
    async findOne(id) {
        const s = await this.prisma.session.findUnique({ where: { id } });
        if (!s)
            throw new common_1.NotFoundException(`Session ${id} not found`);
        return s;
    }
    async revoke(id, reason) {
        await this.findOne(id);
        return this.prisma.session.update({
            where: { id },
            data: { status: "REVOKED", revokedAt: new Date(), revokedReason: reason },
        });
    }
    async revokeAllForUser(userId, exceptId) {
        const r = await this.prisma.session.updateMany({
            where: { userId, id: exceptId ? { not: exceptId } : undefined, status: "ACTIVE" },
            data: { status: "REVOKED", revokedAt: new Date(), revokedReason: "bulk_revoke" },
        });
        return { count: r.count };
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map