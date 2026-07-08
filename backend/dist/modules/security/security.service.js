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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const crypto_1 = __importDefault(require("crypto"));
let SecurityService = class SecurityService {
    prisma;
    config;
    logger = new common_1.Logger("SecurityService");
    encryptionKey;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        const rawKey = process.env.SECURITY_ENCRYPTION_KEY ?? "moataz-default-encryption-key-change-in-production-32+";
        this.encryptionKey = crypto_1.default.createHash("sha256").update(rawKey).digest();
        this.logger.log("Security service initialized");
    }
    async storeSecret(key, value, description, category = "general", createdBy) {
        const { encrypted, iv, authTag } = this.encrypt(value);
        await this.prisma.encryptedSecret.upsert({
            where: { key },
            update: {
                encryptedValue: encrypted,
                iv,
                authTag,
                description,
                category,
                createdBy,
            },
            create: {
                key,
                encryptedValue: encrypted,
                iv,
                authTag,
                description,
                category,
                createdBy,
            },
        });
        this.logger.log(`Secret stored: ${key} [${category}]`);
    }
    async getSecret(key) {
        const secret = await this.prisma.encryptedSecret.findUnique({ where: { key } });
        if (!secret)
            throw new common_1.NotFoundException(`Secret '${key}' not found`);
        return this.decrypt(secret.encryptedValue, secret.iv, secret.authTag);
    }
    async getSecrets(category) {
        const where = {};
        if (category)
            where.category = category;
        return this.prisma.encryptedSecret.findMany({
            where,
            select: {
                id: true,
                key: true,
                description: true,
                category: true,
                rotatedAt: true,
                rotateAfterDays: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { key: "asc" },
        });
    }
    async deleteSecret(key) {
        await this.prisma.encryptedSecret.delete({ where: { key } });
        this.logger.log(`Secret deleted: ${key}`);
    }
    async rotateSecret(key, newValue) {
        await this.storeSecret(key, newValue, undefined, undefined, undefined);
        await this.prisma.encryptedSecret.update({
            where: { key },
            data: { rotatedAt: new Date() },
        });
        this.logger.log(`Secret rotated: ${key}`);
    }
    async getAuditTrail(filter) {
        const where = {};
        if (filter.actorId)
            where.actorId = filter.actorId;
        if (filter.action)
            where.action = { contains: filter.action };
        if (filter.resource)
            where.resource = filter.resource;
        if (filter.startDate || filter.endDate) {
            where.createdAt = {};
            if (filter.startDate)
                where.createdAt.gte = filter.startDate;
            if (filter.endDate)
                where.createdAt.lte = filter.endDate;
        }
        return this.prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: filter.limit ?? 100,
        });
    }
    async checkAccess(userId, resource, action) {
        const userPerms = await this.prisma.userPermission.findMany({
            where: { userId, granted: true },
            include: { permission: true },
        });
        if (userPerms.some((up) => up.permission.slug === "*")) {
            return { allowed: true };
        }
        const requiredPerm = `${resource}:${action}`;
        const hasPerm = userPerms.some((up) => up.permission.slug === requiredPerm);
        if (hasPerm) {
            return { allowed: true };
        }
        const memberships = await this.prisma.membership.findMany({
            where: { userId, status: "active" },
        });
        for (const m of memberships) {
            if (m.role === "OWNER")
                return { allowed: true };
            if (m.role === "ADMIN" && !["security", "billing"].includes(resource)) {
                return { allowed: true };
            }
        }
        return { allowed: false, reason: `Missing permission: ${requiredPerm}` };
    }
    async enforceAccess(userId, resource, action) {
        const { allowed, reason } = await this.checkAccess(userId, resource, action);
        if (!allowed) {
            throw new common_1.ForbiddenException(reason ?? "Access denied");
        }
    }
    encrypt(plaintext) {
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv("aes-256-gcm", this.encryptionKey, iv);
        const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
        const authTag = cipher.getAuthTag();
        return {
            encrypted: encrypted.toString("hex"),
            iv: iv.toString("hex"),
            authTag: authTag.toString("hex"),
        };
    }
    decrypt(encrypted, iv, authTag) {
        const decipher = crypto_1.default.createDecipheriv("aes-256-gcm", this.encryptionKey, Buffer.from(iv, "hex"));
        decipher.setAuthTag(Buffer.from(authTag, "hex"));
        const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, "hex")), decipher.final()]);
        return decrypted.toString("utf8");
    }
};
exports.SecurityService = SecurityService;
exports.SecurityService = SecurityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], SecurityService);
//# sourceMappingURL=security.service.js.map