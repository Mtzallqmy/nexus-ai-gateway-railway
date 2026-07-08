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
var OrganizationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let OrganizationsService = OrganizationsService_1 = class OrganizationsService {
    prisma;
    logger = new common_1.Logger(OrganizationsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, ownerId) {
        const slug = dto.slug ?? this.slugify(dto.name);
        const uniqueSlug = await this.uniqueSlug(slug);
        const org = await this.prisma.organization.create({
            data: {
                name: dto.name,
                slug: uniqueSlug,
                description: dto.description,
                logoUrl: dto.logoUrl,
                ownerId,
                plan: dto.plan,
            },
        });
        await this.prisma.membership.create({
            data: {
                userId: ownerId,
                organizationId: org.id,
                role: "OWNER",
                status: "active",
                acceptedAt: new Date(),
            },
        });
        this.logger.log(`Org created: ${org.slug} (owner=${ownerId})`);
        return org;
    }
    async findAll(query) {
        const where = {};
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: "insensitive" } },
                { slug: { contains: query.search, mode: "insensitive" } },
            ];
        }
        if (query.status)
            where.status = query.status;
        const [items, total] = await Promise.all([
            this.prisma.organization.findMany({
                where,
                orderBy: { [query.sortBy]: query.sortOrder },
                skip: (query.page - 1) * query.pageSize,
                take: query.pageSize,
            }),
            this.prisma.organization.count({ where }),
        ]);
        return (0, pagination_dto_1.buildPagination)(items, total, query);
    }
    async findOne(id) {
        const org = await this.prisma.organization.findUnique({ where: { id } });
        if (!org)
            throw new common_1.NotFoundException(`Organization ${id} not found`);
        return org;
    }
    async findBySlug(slug) {
        return this.prisma.organization.findUnique({ where: { slug } });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.organization.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.organization.update({
            where: { id },
            data: { deletedAt: new Date(), status: "INACTIVE" },
        });
        return { message: "Organization deleted" };
    }
    slugify(s) {
        return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "org";
    }
    async uniqueSlug(base) {
        let candidate = base;
        let n = 1;
        while (await this.prisma.organization.findUnique({ where: { slug: candidate } })) {
            candidate = `${base}-${++n}`;
        }
        return candidate;
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = OrganizationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map