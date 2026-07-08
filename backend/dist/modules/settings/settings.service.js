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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsert(dto, updatedById) {
        return this.prisma.setting.upsert({
            where: { key: dto.key },
            update: {
                value: dto.value,
                type: dto.type,
                description: dto.description,
                category: dto.category,
                isPublic: dto.isPublic,
                organizationId: dto.organizationId ?? null,
                updatedById,
            },
            create: {
                key: dto.key,
                value: dto.value,
                type: dto.type,
                description: dto.description,
                category: dto.category,
                isPublic: dto.isPublic,
                organizationId: dto.organizationId ?? null,
                updatedById,
            },
        });
    }
    async findAll(query) {
        const where = {};
        if (query.category)
            where.category = query.category;
        if (query.organizationId)
            where.organizationId = query.organizationId;
        if (query.isPublic !== undefined)
            where.isPublic = query.isPublic;
        if (query.search)
            where.key = { contains: query.search, mode: "insensitive" };
        const [items, total] = await Promise.all([
            this.prisma.setting.findMany({
                where,
                orderBy: { category: "asc" },
                skip: (query.page - 1) * query.pageSize,
                take: query.pageSize,
            }),
            this.prisma.setting.count({ where }),
        ]);
        return (0, pagination_dto_1.buildPagination)(items, total, query);
    }
    async findByKey(key) {
        const s = await this.prisma.setting.findUnique({ where: { key } });
        if (!s)
            throw new common_1.NotFoundException(`Setting '${key}' not found`);
        return s;
    }
    async getValue(key, defaultValue) {
        const s = await this.prisma.setting.findUnique({ where: { key } });
        if (!s)
            return defaultValue;
        return s.value;
    }
    async remove(key) {
        await this.findByKey(key);
        await this.prisma.setting.delete({ where: { key } });
        return { message: "Setting deleted" };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map