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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let RolesService = class RolesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const slug = dto.slug ?? this.slugify(dto.name);
        const role = await this.prisma.role.create({
            data: {
                name: dto.name,
                slug,
                description: dto.description,
                organizationId: dto.organizationId ?? null,
                color: dto.color,
                isDefault: dto.isDefault,
                permissions: dto.permissionSlugs,
            },
        });
        if (dto.permissionSlugs.length) {
            const perms = await this.prisma.permission.findMany({
                where: { slug: { in: dto.permissionSlugs } },
                select: { id: true },
            });
            if (perms.length) {
                await this.prisma.rolePermission.createMany({
                    data: perms.map((p) => ({ roleId: role.id, permissionId: p.id })),
                    skipDuplicates: true,
                });
            }
        }
        return role;
    }
    async findAll(query) {
        const where = {};
        if (query.organizationId)
            where.organizationId = query.organizationId;
        if (query.isSystem !== undefined)
            where.isSystem = query.isSystem;
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: "insensitive" } },
                { slug: { contains: query.search, mode: "insensitive" } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.role.findMany({
                where,
                include: { rolePermissions: { include: { permission: true } } },
                orderBy: { createdAt: "desc" },
                skip: (query.page - 1) * query.pageSize,
                take: query.pageSize,
            }),
            this.prisma.role.count({ where }),
        ]);
        return (0, pagination_dto_1.buildPagination)(items, total, query);
    }
    async findOne(id) {
        const r = await this.prisma.role.findUnique({
            where: { id },
            include: { rolePermissions: { include: { permission: true } } },
        });
        if (!r)
            throw new common_1.NotFoundException(`Role ${id} not found`);
        return r;
    }
    async update(id, dto) {
        await this.findOne(id);
        const { permissionSlugs, ...rest } = dto;
        const data = { ...rest };
        if (permissionSlugs) {
            data.permissions = permissionSlugs;
        }
        const role = await this.prisma.role.update({ where: { id }, data });
        if (permissionSlugs) {
            await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
            if (permissionSlugs.length) {
                const perms = await this.prisma.permission.findMany({
                    where: { slug: { in: permissionSlugs } },
                    select: { id: true },
                });
                if (perms.length) {
                    await this.prisma.rolePermission.createMany({
                        data: perms.map((p) => ({ roleId: id, permissionId: p.id })),
                        skipDuplicates: true,
                    });
                }
            }
        }
        return role;
    }
    async remove(id) {
        const role = await this.findOne(id);
        if (role.isSystem) {
            throw new Error("Cannot delete system role");
        }
        await this.prisma.role.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { message: "Role deleted" };
    }
    slugify(s) {
        return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "role";
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map