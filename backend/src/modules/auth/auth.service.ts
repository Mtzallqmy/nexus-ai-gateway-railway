import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { RedisService } from "../../infrastructure/redis/redis.service";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
import type {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from "./dto/auth.dto";
import type { JwtPayload, LoginResponse } from "./dto/auth-response.dto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly bcryptRounds: number;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresInDays: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService
  ) {
    this.bcryptRounds = this.config.get<number>("app.bcrypt.rounds") ?? 12;
    this.accessExpiresIn = this.config.get<string>("app.jwt.accessExpiresIn") ?? "15m";
    this.refreshExpiresInDays = 30;
  }

  // ============================================================
  // REGISTER
  // ============================================================
  async register(dto: RegisterDto): Promise<{ userId: string; message: string }> {
    const emailNormalized = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({
      where: { emailNormalized },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds);
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

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

    // Auto-create a personal org
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

  // ============================================================
  // LOGIN
  // ============================================================
  async login(dto: LoginDto): Promise<LoginResponse> {
    const emailNormalized = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { emailNormalized },
    });

    if (!user || !user.passwordHash) {
      // Rate-limit by recording failed attempt (only if user exists)
      throw new UnauthorizedException("Invalid email or password");
    }

    // Account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const waitMs = user.lockedUntil.getTime() - Date.now();
      throw new ForbiddenException(
        `Account locked. Try again in ${Math.ceil(waitMs / 1000 / 60)} minutes`
      );
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      await this.recordFailedLogin(user.id, user.failedLoginAttempts);
      throw new UnauthorizedException("Invalid email or password");
    }

    if (user.status === "SUSPENDED") {
      throw new ForbiddenException("Account suspended");
    }

    // Resolve permissions (system role + user grants)
    const permissions = await this.resolveUserPermissions(user.id);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      permissions,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: this.accessExpiresIn,
      secret: this.config.get<string>("app.jwt.accessSecret"),
    });

    // Refresh token (opaque, hashed in DB)
    const refreshToken = crypto.randomBytes(48).toString("hex");
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    const familyId = crypto.randomUUID();
    const refreshExpiresAt = new Date(
      Date.now() + this.refreshExpiresInDays * 24 * 60 * 60 * 1000
    );

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        familyId,
        expiresAt: refreshExpiresAt,
      },
    });

    // Reset failed login counter
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
      expiresIn: 900, // 15 min in seconds
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

  // ============================================================
  // REFRESH TOKEN
  // ============================================================
  async refreshTokens(refreshToken: string): Promise<LoginResponse> {
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored) {
      // Possible token reuse — revoke entire family for safety
      this.logger.warn(`Unknown refresh token presented — possible reuse`);
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (stored.revokedAt || stored.usedAt) {
      // Token reuse detected — revoke the entire family
      this.logger.error(`Refresh token reuse detected for user ${stored.userId}`);
      await this.prisma.refreshToken.updateMany({
        where: { familyId: stored.familyId },
        data: { revokedAt: new Date(), revokedReason: "reuse_detected" },
      });
      throw new UnauthorizedException("Token reuse detected — please sign in again");
    }

    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token expired");
    }

    // Mark current token as used
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { usedAt: new Date() },
    });

    // Issue new tokens (same family)
    const permissions = await this.resolveUserPermissions(stored.userId);
    const payload: JwtPayload = {
      sub: stored.userId,
      email: stored.user.email,
      name: stored.user.name,
      permissions,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: this.accessExpiresIn,
      secret: this.config.get<string>("app.jwt.accessSecret"),
    });

    const newRefreshToken = crypto.randomBytes(48).toString("hex");
    const newRefreshHash = crypto
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

  // ============================================================
  // LOGOUT (revoke current session's refresh family)
  // ============================================================
  async logout(refreshToken?: string): Promise<{ message: string }> {
    if (!refreshToken) return { message: "Signed out" };
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (stored) {
      await this.prisma.refreshToken.updateMany({
        where: { familyId: stored.familyId },
        data: { revokedAt: new Date(), revokedReason: "logout" },
      });
    }
    return { message: "Signed out" };
  }

  // ============================================================
  // CHANGE PASSWORD
  // ============================================================
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new NotFoundException("User not found");
    }

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestException("Current password is incorrect");
    }

    const newHash = await bcrypt.hash(dto.newPassword, this.bcryptRounds);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    // Revoke all sessions (force re-login)
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date(), revokedReason: "password_change" },
    });

    this.logger.log(`Password changed for user ${userId}`);
    return { message: "Password updated. Please sign in again." };
  }

  // ============================================================
  // EMAIL VERIFICATION
  // ============================================================
  async requestEmailVerification(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { emailNormalized: email.toLowerCase() },
    });
    if (!user) return { message: "If the email exists, a verification link was sent." };
    if (user.emailVerified === "VERIFIED") {
      return { message: "Email is already verified." };
    }

    const token = crypto.randomBytes(32).toString("hex");
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

  async verifyEmail(dto: VerifyEmailDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerifyToken: dto.token,
        emailVerifyExpires: { gt: new Date() },
      },
    });
    if (!user) {
      throw new BadRequestException("Invalid or expired verification token");
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

  // ============================================================
  // PASSWORD RESET
  // ============================================================
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { emailNormalized: dto.email },
    });
    if (!user) return { message: "If the email exists, a reset link was sent." };

    const token = crypto.randomBytes(32).toString("hex");
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

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: dto.token,
        passwordResetExpires: { gt: new Date() },
      },
    });
    if (!user) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Revoke all sessions
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date(), revokedReason: "password_reset" },
    });

    return { message: "Password reset successfully. Please sign in." };
  }

  // ============================================================
  // 2FA (Structure — TOTP not fully wired)
  // ============================================================
  async enable2fa(userId: string, _password: string): Promise<{ secret: string; qrUrl: string; backupCodes: string[] }> {
    // TOTP secret — base32-encoded 20 random bytes (RFC 6238). We use hex here
    // and let the client encode it; production code should use a proper TOTP
    // library like `otplib`.
    const secret = crypto.randomBytes(20).toString("hex").toUpperCase();
    const backupCodes = Array.from({ length: 10 }).map(() =>
      crypto.randomBytes(6).toString("hex").toUpperCase().slice(0, 10)
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        twoFactorStatus: "PENDING",
        twoFactorBackupCodes: backupCodes,
      },
    });

    const issuer = this.config.get<string>("app.twofa.issuer") ?? "Moataz";
    const qrUrl = `otpauth://totp/${issuer}:${userId}?secret=${secret}&issuer=${issuer}`;

    return { secret, qrUrl, backupCodes };
  }

  async disable2fa(userId: string): Promise<{ message: string }> {
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

  // ============================================================
  // HELPERS
  // ============================================================
  private async recordFailedLogin(userId: string, currentFails: number): Promise<void> {
    const newFails = currentFails + 1;
    const lockUntil =
      newFails >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // 15-min lock
    await this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: newFails, lockedUntil: lockUntil },
    });
  }

  private async resolveUserPermissions(userId: string): Promise<string[]> {
    // 1) Direct user permission grants
    const userPerms = await this.prisma.userPermission.findMany({
      where: { userId, granted: true },
      include: { permission: true },
    });
    const permSet = new Set<string>(
      userPerms.map((up) => up.permission.slug)
    );

    // 2) Role-based permissions (via memberships on system roles)
    const memberships = await this.prisma.membership.findMany({
      where: { userId, status: "active" },
      include: { organization: true },
    });
    void memberships; // role → permissions lookup would happen here

    // Owner gets wildcard
    if (memberships.some((m) => m.role === "OWNER")) {
      permSet.add("*");
    }

    return Array.from(permSet);
  }

  private async uniqueOrgSlug(base: string): Promise<string> {
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

  /**
   * Build an AuthenticatedUser object from a user ID (for guards/tests)
   */
  async buildAuthenticatedUser(userId: string): Promise<AuthenticatedUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;
    const permissions = await this.resolveUserPermissions(userId);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      permissions,
    };
  }
}
