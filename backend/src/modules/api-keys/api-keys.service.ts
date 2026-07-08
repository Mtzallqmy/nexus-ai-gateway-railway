import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import crypto from "crypto";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { CreateApiKeyDto, ListApiKeysQueryDto } from "./dto/api-key.dto";
import { buildPagination } from "../../common/dto/pagination.dto";

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);
  private readonly prefix: string;
  private readonly keyLength: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {
    this.prefix = this.config.get<string>("app.apiKey.prefix") ?? "nx";
    this.keyLength = this.config.get<number>("app.apiKey.length") ?? 40;
  }

  async create(dto: CreateApiKeyDto, userId: string) {
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
      key: rawKey, // only time the raw key is returned
      maskedKey,
      name: apiKey.name,
      scopes: apiKey.scopes,
      expiresAt: apiKey.expiresAt?.toISOString() ?? null,
      createdAt: apiKey.createdAt.toISOString(),
    };
  }

  async findAll(query: ListApiKeysQueryDto) {
    const where: Prisma.ApiKeyWhereInput = {};
    if (query.userId) where.userId = query.userId;
    if (query.organizationId) where.organizationId = query.organizationId;
    if (query.projectId) where.projectId = query.projectId;
    if (query.status) where.status = query.status;
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
    return buildPagination(
      items.map((k) => ({
        ...k,
        usageLimit: k.usageLimit?.toString() ?? null,
        usageCount: k.usageCount.toString(),
      })),
      total,
      query
    );
  }

  async findOne(id: string) {
    const k = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!k) throw new NotFoundException(`API key ${id} not found`);
    return {
      ...k,
      usageLimit: k.usageLimit?.toString() ?? null,
      usageCount: k.usageCount.toString(),
    };
  }

  async revoke(id: string, reason?: string) {
    await this.findOne(id);
    return this.prisma.apiKey.update({
      where: { id },
      data: { status: "REVOKED", revokedAt: new Date(), revokedReason: reason },
    });
  }

  async rotate(id: string, userId: string) {
    const existingRaw = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!existingRaw) throw new NotFoundException(`API key ${id} not found`);

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

  async recordUsage(id: string): Promise<void> {
    await this.prisma.apiKey.update({
      where: { id },
      data: { lastUsedAt: new Date(), usageCount: { increment: 1 } },
    });
  }

  /**
   * Validate a raw API key against the database. Returns the key record
   * if valid, or null if not found / revoked / expired.
   */
  async validate(rawKey: string) {
    const keyHash = this.hashKey(rawKey);
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { keyHash },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!apiKey) return null;
    if (apiKey.status !== "ACTIVE") return null;
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;
    return apiKey;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.apiKey.delete({ where: { id } });
    return { message: "API key deleted" };
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private generateRawKey(): string {
    const bytes = crypto.randomBytes(this.keyLength);
    const hex = bytes.toString("hex").slice(0, this.keyLength);
    return `${this.prefix}_${hex}`;
  }

  private hashKey(rawKey: string): string {
    return crypto.createHash("sha256").update(rawKey).digest("hex");
  }
}
