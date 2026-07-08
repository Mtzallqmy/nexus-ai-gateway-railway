import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { ListAuditLogsQueryDto } from "./dto/audit-log.dto";
import { buildPagination } from "../../common/dto/pagination.dto";

export interface AuditContext {
  actorId?: string;
  actorEmail: string;
  action: string;
  status: "SUCCESS" | "FAILURE";
  resource: string;
  resourceId?: string;
  resourceName?: string;
  organizationId?: string;
  projectId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  metadata?: Record<string, unknown>;
  errorMessage?: string;
}

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(ctx: AuditContext): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: ctx.actorId ?? null,
          actorEmail: ctx.actorEmail,
          action: ctx.action as never,
          status: ctx.status,
          resource: ctx.resource,
          resourceId: ctx.resourceId ?? null,
          resourceName: ctx.resourceName ?? null,
          organizationId: ctx.organizationId ?? null,
          projectId: ctx.projectId ?? null,
          ipAddress: ctx.ipAddress ?? null,
          userAgent: ctx.userAgent ?? null,
          location: ctx.location ?? null,
          metadata: (ctx.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
          errorMessage: ctx.errorMessage ?? null,
        },
      });
    } catch (err) {
      // Never let audit logging break the request
      this.logger.error(`Failed to record audit log: ${(err as Error).message}`);
    }
  }

  async findAll(query: ListAuditLogsQueryDto) {
    const where: Prisma.AuditLogWhereInput = {};
    if (query.actorId) where.actorId = query.actorId;
    if (query.action) where.action = { contains: query.action } as never;
    if (query.resource) where.resource = query.resource;
    if (query.organizationId) where.organizationId = query.organizationId;
    if (query.status) where.status = query.status;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }
    if (query.search) {
      where.OR = [
        { actorEmail: { contains: query.search, mode: "insensitive" } },
        { resource: { contains: query.search, mode: "insensitive" } },
        { resourceName: { contains: query.search, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return buildPagination(items, total, query);
  }
}
