import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { CreatePermissionDto, ListPermissionsQueryDto } from "./dto/permission.dto";
import { buildPagination } from "../../common/dto/pagination.dto";

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePermissionDto) {
    return this.prisma.permission.create({ data: dto });
  }

  async findAll(query: ListPermissionsQueryDto) {
    const where: Prisma.PermissionWhereInput = {};
    if (query.resource) where.resource = query.resource;
    if (query.group) where.group = query.group;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { slug: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.permission.findMany({
        where,
        orderBy: [{ group: "asc" }, { name: "asc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.permission.count({ where }),
    ]);
    return buildPagination(items, total, query);
  }

  async findOne(id: string) {
    const p = await this.prisma.permission.findUnique({ where: { id } });
    if (!p) throw new NotFoundException(`Permission ${id} not found`);
    return p;
  }

  async findBySlug(slug: string) {
    return this.prisma.permission.findUnique({ where: { slug } });
  }

  /**
   * Group permissions by their `group` field for UI rendering.
   */
  async grouped() {
    const perms = await this.prisma.permission.findMany({
      orderBy: [{ group: "asc" }, { name: "asc" }],
    });
    const groups: Record<string, typeof perms> = {};
    for (const p of perms) {
      if (!groups[p.group]) groups[p.group] = [];
      groups[p.group].push(p);
    }
    return groups;
  }

  /**
   * Grant a permission directly to a user.
   */
  async grantToUser(userId: string, permissionId: string, grantedBy?: string) {
    return this.prisma.userPermission.upsert({
      where: {
        userId_permissionId: { userId, permissionId },
      },
      update: { granted: true },
      create: { userId, permissionId, granted: true, createdBy: grantedBy },
    });
  }

  /**
   * Revoke a direct user permission grant.
   */
  async revokeFromUser(userId: string, permissionId: string) {
    return this.prisma.userPermission.deleteMany({
      where: { userId, permissionId },
    });
  }

  async remove(id: string) {
    const p = await this.findOne(id);
    if (p.isSystem) throw new Error("Cannot delete system permission");
    await this.prisma.permission.delete({ where: { id } });
    return { message: "Permission deleted" };
  }
}
