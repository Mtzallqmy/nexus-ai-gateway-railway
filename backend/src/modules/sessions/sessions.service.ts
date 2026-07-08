import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { ListSessionsQueryDto } from "./dto/session.dto";
import { buildPagination } from "../../common/dto/pagination.dto";

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListSessionsQueryDto) {
    const where: Prisma.SessionWhereInput = {};
    if (query.userId) where.userId = query.userId;
    if (query.status) where.status = query.status;
    const [items, total] = await Promise.all([
      this.prisma.session.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select: {
          id: true,
          userId: true,
          status: true,
          ipAddress: true,
          userAgent: true,
          deviceName: true,
          location: true,
          expiresAt: true,
          lastUsedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.session.count({ where }),
    ]);
    return buildPagination(items, total, query);
  }

  async findOne(id: string) {
    const s = await this.prisma.session.findUnique({ where: { id } });
    if (!s) throw new NotFoundException(`Session ${id} not found`);
    return s;
  }

  async revoke(id: string, reason?: string) {
    await this.findOne(id);
    return this.prisma.session.update({
      where: { id },
      data: { status: "REVOKED", revokedAt: new Date(), revokedReason: reason },
    });
  }

  async revokeAllForUser(userId: string, exceptId?: string): Promise<{ count: number }> {
    const r = await this.prisma.session.updateMany({
      where: { userId, id: exceptId ? { not: exceptId } : undefined, status: "ACTIVE" },
      data: { status: "REVOKED", revokedAt: new Date(), revokedReason: "bulk_revoke" },
    });
    return { count: r.count };
  }
}
