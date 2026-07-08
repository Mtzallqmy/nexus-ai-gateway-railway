import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { CreateRoleDto, ListRolesQueryDto, UpdateRoleDto } from "./dto/role.dto";
import { buildPagination } from "../../common/dto/pagination.dto";

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    const slug = dto.slug ?? this.slugify(dto.name);
    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        organizationId: dto.organizationId ?? null,
        color: dto.color,
        isDefault: dto.isDefault,
        permissions: dto.permissionSlugs,
      },
    });

    // Attach permission slugs as role-permission rows (if permission exists)
    if (dto.permissionSlugs.length) {
      const perms = await this.prisma.permission.findMany({
        where: { slug: { in: dto.permissionSlugs } },
        select: { id: true },
      });
      if (perms.length) {
        await this.prisma.rolePermission.createMany({
          data: perms.map((p) => ({ roleId: role.id, permissionId: p.id })),
          skipDuplicates: true,
        });
      }
    }

    return role;
  }

  async findAll(query: ListRolesQueryDto) {
    const where: Prisma.RoleWhereInput = {};
    if (query.organizationId) where.organizationId = query.organizationId;
    if (query.isSystem !== undefined) where.isSystem = query.isSystem;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { slug: { contains: query.search, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        include: { rolePermissions: { include: { permission: true } } },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.role.count({ where }),
    ]);
    return buildPagination(items, total, query);
  }

  async findOne(id: string) {
    const r = await this.prisma.role.findUnique({
      where: { id },
      include: { rolePermissions: { include: { permission: true } } },
    });
    if (!r) throw new NotFoundException(`Role ${id} not found`);
    return r;
  }

  async update(id: string, dto: UpdateRoleDto) {
    await this.findOne(id);
    const { permissionSlugs, ...rest } = dto;
    const data: Prisma.RoleUpdateInput = { ...rest };
    if (permissionSlugs) {
      data.permissions = permissionSlugs;
    }
    const role = await this.prisma.role.update({ where: { id }, data });

    if (permissionSlugs) {
      // Replace role-permission rows
      await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
      if (permissionSlugs.length) {
        const perms = await this.prisma.permission.findMany({
          where: { slug: { in: permissionSlugs } },
          select: { id: true },
        });
        if (perms.length) {
          await this.prisma.rolePermission.createMany({
            data: perms.map((p) => ({ roleId: id, permissionId: p.id })),
            skipDuplicates: true,
          });
        }
      }
    }

    return role;
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if (role.isSystem) {
      throw new Error("Cannot delete system role");
    }
    await this.prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: "Role deleted" };
  }

  private slugify(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "role";
  }
}
