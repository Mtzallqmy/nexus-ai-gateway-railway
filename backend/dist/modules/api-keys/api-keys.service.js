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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ApiKeysService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeysService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = __importDefault(require("crypto"));
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let ApiKeysService = ApiKeysService_1 = class ApiKeysService {
    prisma;
    config;
    logger = new common_1.Logger(ApiKeysService_1.name);
    prefix;
    keyLength;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.prefix = this.config.get("app.apiKey.prefix") ?? "nx";
        this.keyLength = this.config.get("app.apiKey.length") ?? 40;
    }
    async create(dto, userId) {
        const rawKey = this.generateRawKey();
        const keyHash = this.hashKey(rawKey);
        const keyPrefix = rawKey.slice(0, 8);
        const maskedKey = `${rawKey.slice(0, 8)}${"•".repeat(16)}${rawKey.slice(-4)}`;
        const apiKey = await this.prisma.apiKey.create({
            data: {
                name: dto.name,
                keyPrefix,
                keyHash,
                maskedKey,
                status: "ACTIVE",
                scopes: dto.scopes,
                userId,
                organizationId: dto.organizationId ?? null,
                projectId: dto.projectId ?? null,
                usageLimit: dto.usageLimit ? BigInt(dto.usageLimit) : null,
                rateLimitRps: dto.rateLimitRps ?? null,
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
                createdBy: userId,
            },
        });
        this.logger.log(`API key created: ${dto.name} (id=${apiKey.id})`);
        return {
            id: apiKey.id,
            key: rawKey,
            maskedKey,
            name: apiKey.name,
            scopes: apiKey.scopes,
            expiresAt: apiKey.expiresAt?.toISOString() ?? null,
            createdAt: apiKey.createdAt.toISOString(),
        };
    }
    async findAll(query) {
        const where = {};
        if (query.userId)
            where.userId = query.userId;
        if (query.organizationId)
            where.organizationId = query.organizationId;
        if (query.projectId)
            where.projectId = query.projectId;
        if (query.status)
            where.status = query.status;
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: "insensitive" } },
                { keyPrefix: { contains: query.search, mode: "insensitive" } },
            ];
        }
        const [items, total] = await Promise.all([
            this.prisma.apiKey.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (query.page - 1) * query.pageSize,
                take: query.pageSize,
                select: {
                    id: true,
                    name: true,
                    keyPrefix: true,
                    maskedKey: true,
                    status: true,
                    scopes: true,
                    usageLimit: true,
                    usageCount: true,
                    rateLimitRps: true,
                    lastUsedAt: true,
                    expiresAt: true,
                    revokedAt: true,
                    createdAt: true,
                    updatedAt: true,
                    user: { select: { id: true, name: true, email: true } },
                },
            }),
            this.prisma.apiKey.count({ where }),
        ]);
        return (0, pagination_dto_1.buildPagination)(items.map((k) => ({
            ...k,
            usageLimit: k.usageLimit?.toString() ?? null,
            usageCount: k.usageCount.toString(),
        })), total, query);
    }
    async findOne(id) {
        const k = await this.prisma.apiKey.findUnique({ where: { id } });
        if (!k)
            throw new common_1.NotFoundException(`API key ${id} not found`);
        return {
            ...k,
            usageLimit: k.usageLimit?.toString() ?? null,
            usageCount: k.usageCount.toString(),
        };
    }
    async revoke(id, reason) {
        await this.findOne(id);
        return this.prisma.apiKey.update({
            where: { id },
            data: { status: "REVOKED", revokedAt: new Date(), revokedReason: reason },
        });
    }
    async rotate(id, userId) {
        const existingRaw = await this.prisma.apiKey.findUnique({ where: { id } });
        if (!existingRaw)
            throw new common_1.NotFoundException(`API key ${id} not found`);
        const rawKey = this.generateRawKey();
        const keyHash = this.hashKey(rawKey);
        const keyPrefix = rawKey.slice(0, 8);
        const maskedKey = `${rawKey.slice(0, 8)}${"•".repeat(16)}${rawKey.slice(-4)}`;
        await this.prisma.apiKey.update({
            where: { id },
            data: { status: "REVOKED", revokedAt: new Date(), revokedReason: "rotated" },
        });
        const newKey = await this.prisma.apiKey.create({
            data: {
                name: existingRaw.name,
                keyPrefix,
                keyHash,
                maskedKey,
                status: "ACTIVE",
                scopes: existingRaw.scopes,
                userId,
                organizationId: existingRaw.organizationId ?? null,
                projectId: existingRaw.projectId ?? null,
                usageLimit: existingRaw.usageLimit ?? undefined,
                rateLimitRps: existingRaw.rateLimitRps ?? null,
                createdBy: userId,
            },
        });
        return {
            id: newKey.id,
            key: rawKey,
            maskedKey,
            message: "Key rotated. Update your integrations with the new key.",
        };
    }
    async recordUsage(id) {
        await this.prisma.apiKey.update({
            where: { id },
            data: { lastUsedAt: new Date(), usageCount: { increment: 1 } },
        });
    }
    async validate(rawKey) {
        const keyHash = this.hashKey(rawKey);
        const apiKey = await this.prisma.apiKey.findUnique({
            where: { keyHash },
            include: { user: { select: { id: true, name: true, email: true } } },
        });
        if (!apiKey)
            return null;
        if (apiKey.status !== "ACTIVE")
            return null;
        if (apiKey.expiresAt && apiKey.expiresAt < new Date())
            return null;
        return apiKey;
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.apiKey.delete({ where: { id } });
        return { message: "API key deleted" };
    }
    generateRawKey() {
        const bytes = crypto_1.default.randomBytes(this.keyLength);
        const hex = bytes.toString("hex").slice(0, this.keyLength);
        return `${this.prefix}_${hex}`;
    }
    hashKey(rawKey) {
        return crypto_1.default.createHash("sha256").update(rawKey).digest("hex");
    }
};
exports.ApiKeysService = ApiKeysService;
exports.ApiKeysService = ApiKeysService = ApiKeysService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], ApiKeysService);
//# sourceMappingURL=api-keys.service.js.map