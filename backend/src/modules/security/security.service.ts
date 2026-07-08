/**
 * Security Service — Encrypted storage, secret management, audit trail, access control.
 *
 * Uses AES-256-GCM for encryption. The encryption key is derived from
 * the SECURITY_ENCRYPTION_KEY env var.
 */
import { Injectable, Logger, NotFoundException, ForbiddenException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import crypto from "crypto";

@Injectable()
export class SecurityService {
  private readonly logger = new Logger("SecurityService");
  private readonly encryptionKey: Buffer;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {
    // Derive a 32-byte key from the env var (or a default for dev)
    const rawKey = process.env.SECURITY_ENCRYPTION_KEY ?? "moataz-default-encryption-key-change-in-production-32+";
    this.encryptionKey = crypto.createHash("sha256").update(rawKey).digest();
    this.logger.log("Security service initialized");
  }

  // ============================================================
  // ENCRYPTED STORAGE / SECRET MANAGEMENT
  // ============================================================

  async storeSecret(key: string, value: string, description?: string, category = "general", createdBy?: string): Promise<void> {
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

  async getSecret(key: string): Promise<string> {
    const secret = await this.prisma.encryptedSecret.findUnique({ where: { key } });
    if (!secret) throw new NotFoundException(`Secret '${key}' not found`);
    return this.decrypt(secret.encryptedValue, secret.iv, secret.authTag);
  }

  async getSecrets(category?: string) {
    const where: Prisma.EncryptedSecretWhereInput = {};
    if (category) where.category = category;
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

  async deleteSecret(key: string): Promise<void> {
    await this.prisma.encryptedSecret.delete({ where: { key } });
    this.logger.log(`Secret deleted: ${key}`);
  }

  async rotateSecret(key: string, newValue: string): Promise<void> {
    await this.storeSecret(key, newValue, undefined, undefined, undefined);
    await this.prisma.encryptedSecret.update({
      where: { key },
      data: { rotatedAt: new Date() },
    });
    this.logger.log(`Secret rotated: ${key}`);
  }

  // ============================================================
  // AUDIT TRAIL (extends AuditLogsModule)
  // ============================================================

  async getAuditTrail(filter: {
    actorId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const where: Prisma.AuditLogWhereInput = {};
    if (filter.actorId) where.actorId = filter.actorId;
    if (filter.action) where.action = { contains: filter.action } as never;
    if (filter.resource) where.resource = filter.resource;
    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) where.createdAt.gte = filter.startDate;
      if (filter.endDate) where.createdAt.lte = filter.endDate;
    }

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: filter.limit ?? 100,
    });
  }

  // ============================================================
  // ACCESS CONTROL
  // ============================================================

  async checkAccess(userId: string, resource: string, action: string): Promise<{ allowed: boolean; reason?: string }> {
    // Check if user has the required permission
    const userPerms = await this.prisma.userPermission.findMany({
      where: { userId, granted: true },
      include: { permission: true },
    });

    // Check for wildcard
    if (userPerms.some((up) => up.permission.slug === "*")) {
      return { allowed: true };
    }

    // Check for specific permission
    const requiredPerm = `${resource}:${action}`;
    const hasPerm = userPerms.some((up) => up.permission.slug === requiredPerm);
    if (hasPerm) {
      return { allowed: true };
    }

    // Check role-based permissions via memberships
    const memberships = await this.prisma.membership.findMany({
      where: { userId, status: "active" },
    });

    for (const m of memberships) {
      if (m.role === "OWNER") return { allowed: true };
      // Admin has broad access except to security operations
      if (m.role === "ADMIN" && !["security", "billing"].includes(resource)) {
        return { allowed: true };
      }
    }

    return { allowed: false, reason: `Missing permission: ${requiredPerm}` };
  }

  async enforceAccess(userId: string, resource: string, action: string): Promise<void> {
    const { allowed, reason } = await this.checkAccess(userId, resource, action);
    if (!allowed) {
      throw new ForbiddenException(reason ?? "Access denied");
    }
  }

  // ============================================================
  // ENCRYPTION HELPERS (AES-256-GCM)
  // ============================================================

  private encrypt(plaintext: string): { encrypted: string; iv: string; authTag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", this.encryptionKey, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return {
      encrypted: encrypted.toString("hex"),
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
    };
  }

  private decrypt(encrypted: string, iv: string, authTag: string): string {
    const decipher = crypto.createDecipheriv("aes-256-gcm", this.encryptionKey, Buffer.from(iv, "hex"));
    decipher.setAuthTag(Buffer.from(authTag, "hex"));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, "hex")), decipher.final()]);
    return decrypted.toString("utf8");
  }
}
