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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let ProjectsService = class ProjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, ownerId) {
        const slug = dto.slug ?? this.slugify(dto.name);
        return this.prisma.project.create({
            data: {
                name: dto.name,
                slug,
                description: dto.description,
                organizationId: dto.organizationId,
                teamId: dto.teamId,
                ownerId,
                metadata: dto.metadata ?? client_1.Prisma.JsonNull,
            },
        });
    }
    async findAll(query) {
        const where = {};
        if (query.organizationId)
            where.organizationId = query.organizationId;
        if (query.teamId)
            where.teamId = query.teamId;
        if (query.status)
            where.status = query.status;
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: "insensitive" } },
                { slug: { contains: query.search, mode: "insensitive" } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.project.findMany({
                where,
                orderBy: { [query.sortBy]: query.sortOrder },
                skip: (query.page - 1) * query.pageSize,
                take: query.pageSize,
            }),
            this.prisma.project.count({ where }),
        ]);
        return (0, pagination_dto_1.buildPagination)(items, total, query);
    }
    async findOne(id) {
        const p = await this.prisma.project.findUnique({ where: { id } });
        if (!p)
            throw new common_1.NotFoundException(`Project ${id} not found`);
        return p;
    }
    async update(id, dto) {
        await this.findOne(id);
        const { metadata, ...rest } = dto;
        const data = { ...rest };
        if (metadata)
            data.metadata = metadata;
        return this.prisma.project.update({ where: { id }, data });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.project.update({
            where: { id },
            data: { deletedAt: new Date(), status: "DELETED" },
        });
        return { message: "Project deleted" };
    }
    slugify(s) {
        return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "project";
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map