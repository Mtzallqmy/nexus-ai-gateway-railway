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
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let PermissionsService = class PermissionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.permission.create({ data: dto });
    }
    async findAll(query) {
        const where = {};
        if (query.resource)
            where.resource = query.resource;
        if (query.group)
            where.group = query.group;
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: "insensitive" } },
                { slug: { contains: query.search, mode: "insensitive" } },
                { description: { contains: query.search, mode: "insensitive" } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.permission.findMany({
                where,
                orderBy: [{ group: "asc" }, { name: "asc" }],
                skip: (query.page - 1) * query.pageSize,
                take: query.pageSize,
            }),
            this.prisma.permission.count({ where }),
        ]);
        return (0, pagination_dto_1.buildPagination)(items, total, query);
    }
    async findOne(id) {
        const p = await this.prisma.permission.findUnique({ where: { id } });
        if (!p)
            throw new common_1.NotFoundException(`Permission ${id} not found`);
        return p;
    }
    async findBySlug(slug) {
        return this.prisma.permission.findUnique({ where: { slug } });
    }
    async grouped() {
        const perms = await this.prisma.permission.findMany({
            orderBy: [{ group: "asc" }, { name: "asc" }],
        });
        const groups = {};
        for (const p of perms) {
            if (!groups[p.group])
                groups[p.group] = [];
            groups[p.group].push(p);
        }
        return groups;
    }
    async grantToUser(userId, permissionId, grantedBy) {
        return this.prisma.userPermission.upsert({
            where: {
                userId_permissionId: { userId, permissionId },
            },
            update: { granted: true },
            create: { userId, permissionId, granted: true, createdBy: grantedBy },
        });
    }
    async revokeFromUser(userId, permissionId) {
        return this.prisma.userPermission.deleteMany({
            where: { userId, permissionId },
        });
    }
    async remove(id) {
        const p = await this.findOne(id);
        if (p.isSystem)
            throw new Error("Cannot delete system permission");
        await this.prisma.permission.delete({ where: { id } });
        return { message: "Permission deleted" };
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map