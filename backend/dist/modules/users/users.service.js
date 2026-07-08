"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let UsersService = UsersService_1 = class UsersService {
    prisma;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const emailNormalized = dto.email.toLowerCase().trim();
        const data = {
            email: dto.email,
            emailNormalized,
            name: dto.name,
            jobTitle: dto.jobTitle,
            location: dto.location,
            bio: dto.bio,
            website: dto.website,
            status: "PENDING",
            emailVerified: "UNVERIFIED",
            preferences: client_1.Prisma.JsonNull,
        };
        if (dto.password) {
            const bcrypt = await Promise.resolve().then(() => __importStar(require("bcrypt")));
            data.passwordHash = await bcrypt.hash(dto.password, 12);
        }
        const user = await this.prisma.user.create({ data });
        this.logger.log(`User created: ${user.email}`);
        return this.sanitize(user);
    }
    async findAll(query) {
        const where = {};
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: "insensitive" } },
                { email: { contains: query.search, mode: "insensitive" } },
            ];
        }
        if (query.status)
            where.status = query.status;
        const orderBy = {
            [query.sortBy]: query.sortOrder,
        };
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                orderBy,
                skip: (query.page - 1) * query.pageSize,
                take: query.pageSize,
                select: this.selectFields(),
            }),
            this.prisma.user.count({ where }),
        ]);
        return (0, pagination_dto_1.buildPagination)(users, total, query);
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: this.selectFields(),
        });
        if (!user)
            throw new common_1.NotFoundException(`User ${id} not found`);
        return user;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { emailNormalized: email.toLowerCase().trim() },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        const user = await this.prisma.user.update({
            where: { id },
            data: dto,
            select: this.selectFields(),
        });
        this.logger.log(`User updated: ${id}`);
        return user;
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date(), status: "INACTIVE" },
        });
        this.logger.log(`User soft-deleted: ${id}`);
        return { message: "User deleted" };
    }
    selectFields() {
        return {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            jobTitle: true,
            location: true,
            bio: true,
            website: true,
            status: true,
            emailVerified: true,
            twoFactorStatus: true,
            lastLoginAt: true,
            lastActiveAt: true,
            createdAt: true,
            updatedAt: true,
        };
    }
    sanitize(user) {
        const { passwordHash: _omit, ...rest } = user;
        void _omit;
        return rest;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map