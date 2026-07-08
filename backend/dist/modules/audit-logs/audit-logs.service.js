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
var AuditLogsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let AuditLogsService = AuditLogsService_1 = class AuditLogsService {
    prisma;
    logger = new common_1.Logger(AuditLogsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async record(ctx) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    actorId: ctx.actorId ?? null,
                    actorEmail: ctx.actorEmail,
                    action: ctx.action,
                    status: ctx.status,
                    resource: ctx.resource,
                    resourceId: ctx.resourceId ?? null,
                    resourceName: ctx.resourceName ?? null,
                    organizationId: ctx.organizationId ?? null,
                    projectId: ctx.projectId ?? null,
                    ipAddress: ctx.ipAddress ?? null,
                    userAgent: ctx.userAgent ?? null,
                    location: ctx.location ?? null,
                    metadata: ctx.metadata ?? client_1.Prisma.JsonNull,
                    errorMessage: ctx.errorMessage ?? null,
                },
            });
        }
        catch (err) {
            this.logger.error(`Failed to record audit log: ${err.message}`);
        }
    }
    async findAll(query) {
        const where = {};
        if (query.actorId)
            where.actorId = query.actorId;
        if (query.action)
            where.action = { contains: query.action };
        if (query.resource)
            where.resource = query.resource;
        if (query.organizationId)
            where.organizationId = query.organizationId;
        if (query.status)
            where.status = query.status;
        if (query.startDate || query.endDate) {
            where.createdAt = {};
            if (query.startDate)
                where.createdAt.gte = new Date(query.startDate);
            if (query.endDate)
                where.createdAt.lte = new Date(query.endDate);
        }
        if (query.search) {
            where.OR = [
                { actorEmail: { contains: query.search, mode: "insensitive" } },
                { resource: { contains: query.search, mode: "insensitive" } },
                { resourceName: { contains: query.search, mode: "insensitive" } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                orderBy: { [query.sortBy]: query.sortOrder },
                skip: (query.page - 1) * query.pageSize,
                take: query.pageSize,
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return (0, pagination_dto_1.buildPagination)(items, total, query);
    }
};
exports.AuditLogsService = AuditLogsService;
exports.AuditLogsService = AuditLogsService = AuditLogsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogsService);
//# sourceMappingURL=audit-logs.service.js.map