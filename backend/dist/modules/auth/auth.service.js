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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwt;
    config;
    redis;
    logger = new common_1.Logger(AuthService_1.name);
    bcryptRounds;
    accessExpiresIn;
    refreshExpiresInDays;
    constructor(prisma, jwt, config, redis) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.redis = redis;
        this.bcryptRounds = this.config.get("app.bcrypt.rounds") ?? 12;
        this.accessExpiresIn = this.config.get("app.jwt.accessExpiresIn") ?? "15m";
        this.refreshExpiresInDays = 30;
    }
    async register(dto) {
        const emailNormalized = dto.email.toLowerCase().trim();
        const existing = await this.prisma.user.findUnique({
            where: { emailNormalized },
            select: { id: true },
        });
        if (existing) {
            throw new common_1.ConflictException("An account with this email already exists");
        }
        const passwordHash = await bcrypt_1.default.hash(dto.password, this.bcryptRounds);
        const verifyToken = crypto_1.default.randomBytes(32).toString("hex");
        const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                emailNormalized,
                passwordHash,
                name: dto.name,
                status: "PENDING",
                emailVerified: "UNVERIFIED",
                emailVerifyToken: verifyToken,
                emailVerifyExpires: verifyExpires,
            },
        });
        const slug = await this.uniqueOrgSlug(dto.name);
        await this.prisma.organization.create({
            data: {
                name: `${dto.name}'s Workspace`,
                slug,
                ownerId: user.id,
                plan: "free",
            },
        });
        await this.prisma.notification.create({
            data: {
                userId: user.id,
                title: "Verify your email",
                message: `Welcome to Moataz AI Gateway! Use the verification link sent to ${user.email} to activate your account.`,
                type: "INFO",
                channel: "IN_APP",
                category: "auth",
                actionUrl: `/verify-email?token=${verifyToken}`,
                actionLabel: "Verify Email",
            },
        });
        this.logger.log(`User registered: ${user.email} (id=${user.id})`);
        return {
            userId: user.id,
            message: "Account created. Check your email to verify your account.",
        };
    }
    async login(dto) {
        const emailNormalized = dto.email.toLowerCase().trim();
        const user = await this.prisma.user.findUnique({
            where: { emailNormalized },
        });
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException("Invalid email or password");
        }
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const waitMs = user.lockedUntil.getTime() - Date.now();
            throw new common_1.ForbiddenException(`Account locked. Try again in ${Math.ceil(waitMs / 1000 / 60)} minutes`);
        }
        const passwordValid = await bcrypt_1.default.compare(dto.password, user.passwordHash);
        if (!passwordValid) {
            await this.recordFailedLogin(user.id, user.failedLoginAttempts);
            throw new common_1.UnauthorizedException("Invalid email or password");
        }
        if (user.status === "SUSPENDED") {
            throw new common_1.ForbiddenException("Account suspended");
        }
        const permissions = await this.resolveUserPermissions(user.id);
        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            permissions,
        };
        const accessToken = await this.jwt.signAsync(payload, {
            expiresIn: this.accessExpiresIn,
            secret: this.config.get("app.jwt.accessSecret"),
        });
        const refreshToken = crypto_1.default.randomBytes(48).toString("hex");
        const refreshTokenHash = crypto_1.default
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");
        const familyId = crypto_1.default.randomUUID();
        const refreshExpiresAt = new Date(Date.now() + this.refreshExpiresInDays * 24 * 60 * 60 * 1000);
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: refreshTokenHash,
                familyId,
                expiresAt: refreshExpiresAt,
            },
        });
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
                status: user.status === "PENDING" ? "ACTIVE" : user.status,
            },
        });
        this.logger.log(`User logged in: ${user.email}`);
        return {
            accessToken,
            refreshToken,
            expiresIn: 900,
            tokenType: "Bearer",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
                permissions,
                emailVerified: user.emailVerified === "VERIFIED",
                twoFactorEnabled: user.twoFactorStatus === "ENABLED",
            },
        };
    }
    async refreshTokens(refreshToken) {
        const tokenHash = crypto_1.default.createHash("sha256").update(refreshToken).digest("hex");
        const stored = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
        if (!stored) {
            this.logger.warn(`Unknown refresh token presented — possible reuse`);
            throw new common_1.UnauthorizedException("Invalid refresh token");
        }
        if (stored.revokedAt || stored.usedAt) {
            this.logger.error(`Refresh token reuse detected for user ${stored.userId}`);
            await this.prisma.refreshToken.updateMany({
                where: { familyId: stored.familyId },
                data: { revokedAt: new Date(), revokedReason: "reuse_detected" },
            });
            throw new common_1.UnauthorizedException("Token reuse detected — please sign in again");
        }
        if (stored.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException("Refresh token expired");
        }
        await this.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { usedAt: new Date() },
        });
        const permissions = await this.resolveUserPermissions(stored.userId);
        const payload = {
            sub: stored.userId,
            email: stored.user.email,
            name: stored.user.name,
            permissions,
        };
        const accessToken = await this.jwt.signAsync(payload, {
            expiresIn: this.accessExpiresIn,
            secret: this.config.get("app.jwt.accessSecret"),
        });
        const newRefreshToken = crypto_1.default.randomBytes(48).toString("hex");
        const newRefreshHash = crypto_1.default
            .createHash("sha256")
            .update(newRefreshToken)
            .digest("hex");
        await this.prisma.refreshToken.create({
            data: {
                userId: stored.userId,
                tokenHash: newRefreshHash,
                familyId: stored.familyId,
                expiresAt: new Date(Date.now() + this.refreshExpiresInDays * 24 * 60 * 60 * 1000),
                replacedById: stored.id,
            },
        });
        return {
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn: 900,
            tokenType: "Bearer",
            user: {
                id: stored.user.id,
                email: stored.user.email,
                name: stored.user.name,
                avatarUrl: stored.user.avatarUrl,
                permissions,
                emailVerified: stored.user.emailVerified === "VERIFIED",
                twoFactorEnabled: stored.user.twoFactorStatus === "ENABLED",
            },
        };
    }
    async logout(refreshToken) {
        if (!refreshToken)
            return { message: "Signed out" };
        const tokenHash = crypto_1.default.createHash("sha256").update(refreshToken).digest("hex");
        const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
        if (stored) {
            await this.prisma.refreshToken.updateMany({
                where: { familyId: stored.familyId },
                data: { revokedAt: new Date(), revokedReason: "logout" },
            });
        }
        return { message: "Signed out" };
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.passwordHash) {
            throw new common_1.NotFoundException("User not found");
        }
        const valid = await bcrypt_1.default.compare(dto.currentPassword, user.passwordHash);
        if (!valid) {
            throw new common_1.BadRequestException("Current password is incorrect");
        }
        const newHash = await bcrypt_1.default.hash(dto.newPassword, this.bcryptRounds);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newHash },
        });
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date(), revokedReason: "password_change" },
        });
        this.logger.log(`Password changed for user ${userId}`);
        return { message: "Password updated. Please sign in again." };
    }
    async requestEmailVerification(email) {
        const user = await this.prisma.user.findUnique({
            where: { emailNormalized: email.toLowerCase() },
        });
        if (!user)
            return { message: "If the email exists, a verification link was sent." };
        if (user.emailVerified === "VERIFIED") {
            return { message: "Email is already verified." };
        }
        const token = crypto_1.default.randomBytes(32).toString("hex");
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerifyToken: token,
                emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });
        await this.prisma.notification.create({
            data: {
                userId: user.id,
                title: "Verify your email",
                message: "Click the link to verify your email address.",
                type: "INFO",
                channel: "IN_APP",
                category: "auth",
                actionUrl: `/verify-email?token=${token}`,
                actionLabel: "Verify Email",
            },
        });
        return { message: "Verification email sent." };
    }
    async verifyEmail(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                emailVerifyToken: dto.token,
                emailVerifyExpires: { gt: new Date() },
            },
        });
        if (!user) {
            throw new common_1.BadRequestException("Invalid or expired verification token");
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: "VERIFIED",
                emailVerifiedAt: new Date(),
                emailVerifyToken: null,
                emailVerifyExpires: null,
                status: "ACTIVE",
            },
        });
        return { message: "Email verified successfully" };
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({
            where: { emailNormalized: dto.email },
        });
        if (!user)
            return { message: "If the email exists, a reset link was sent." };
        const token = crypto_1.default.randomBytes(32).toString("hex");
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: token,
                passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
            },
        });
        await this.prisma.notification.create({
            data: {
                userId: user.id,
                title: "Password reset requested",
                message: "Use the link to reset your password. The link expires in 1 hour.",
                type: "WARNING",
                channel: "IN_APP",
                category: "auth",
                actionUrl: `/reset-password?token=${token}`,
                actionLabel: "Reset Password",
            },
        });
        return { message: "Password reset link sent." };
    }
    async resetPassword(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                passwordResetToken: dto.token,
                passwordResetExpires: { gt: new Date() },
            },
        });
        if (!user) {
            throw new common_1.BadRequestException("Invalid or expired reset token");
        }
        const passwordHash = await bcrypt_1.default.hash(dto.password, this.bcryptRounds);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });
        await this.prisma.refreshToken.updateMany({
            where: { userId: user.id, revokedAt: null },
            data: { revokedAt: new Date(), revokedReason: "password_reset" },
        });
        return { message: "Password reset successfully. Please sign in." };
    }
    async enable2fa(userId, _password) {
        const secret = crypto_1.default.randomBytes(20).toString("hex").toUpperCase();
        const backupCodes = Array.from({ length: 10 }).map(() => crypto_1.default.randomBytes(6).toString("hex").toUpperCase().slice(0, 10));
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorSecret: secret,
                twoFactorStatus: "PENDING",
                twoFactorBackupCodes: backupCodes,
            },
        });
        const issuer = this.config.get("app.twofa.issuer") ?? "Moataz";
        const qrUrl = `otpauth://totp/${issuer}:${userId}?secret=${secret}&issuer=${issuer}`;
        return { secret, qrUrl, backupCodes };
    }
    async disable2fa(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorStatus: "DISABLED",
                twoFactorSecret: null,
                twoFactorBackupCodes: [],
            },
        });
        return { message: "2FA disabled" };
    }
    async recordFailedLogin(userId, currentFails) {
        const newFails = currentFails + 1;
        const lockUntil = newFails >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
        await this.prisma.user.update({
            where: { id: userId },
            data: { failedLoginAttempts: newFails, lockedUntil: lockUntil },
        });
    }
    async resolveUserPermissions(userId) {
        const userPerms = await this.prisma.userPermission.findMany({
            where: { userId, granted: true },
            include: { permission: true },
        });
        const permSet = new Set(userPerms.map((up) => up.permission.slug));
        const memberships = await this.prisma.membership.findMany({
            where: { userId, status: "active" },
            include: { organization: true },
        });
        void memberships;
        if (memberships.some((m) => m.role === "OWNER")) {
            permSet.add("*");
        }
        return Array.from(permSet);
    }
    async uniqueOrgSlug(base) {
        const slug = base
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "workspace";
        let candidate = `${slug}-workspace`;
        let n = 1;
        while (await this.prisma.organization.findUnique({ where: { slug: candidate } })) {
            candidate = `${slug}-${++n}`;
        }
        return candidate;
    }
    async buildAuthenticatedUser(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return null;
        const permissions = await this.resolveUserPermissions(userId);
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            permissions,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        redis_service_1.RedisService])
], AuthService);
//# sourceMappingURL=auth.service.js.map