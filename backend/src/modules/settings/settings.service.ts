import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { ListSettingsQueryDto, UpsertSettingDto } from "./dto/setting.dto";
import { buildPagination } from "../../common/dto/pagination.dto";

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(dto: UpsertSettingDto, updatedById: string) {
    return this.prisma.setting.upsert({
      where: { key: dto.key },
      update: {
        value: dto.value as Prisma.InputJsonValue,
        type: dto.type,
        description: dto.description,
        category: dto.category,
        isPublic: dto.isPublic,
        organizationId: dto.organizationId ?? null,
        updatedById,
      },
      create: {
        key: dto.key,
        value: dto.value as Prisma.InputJsonValue,
        type: dto.type,
        description: dto.description,
        category: dto.category,
        isPublic: dto.isPublic,
        organizationId: dto.organizationId ?? null,
        updatedById,
      },
    });
  }

  async findAll(query: ListSettingsQueryDto) {
    const where: Prisma.SettingWhereInput = {};
    if (query.category) where.category = query.category;
    if (query.organizationId) where.organizationId = query.organizationId;
    if (query.isPublic !== undefined) where.isPublic = query.isPublic;
    if (query.search) where.key = { contains: query.search, mode: "insensitive" };
    const [items, total] = await Promise.all([
      this.prisma.setting.findMany({
        where,
        orderBy: { category: "asc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.setting.count({ where }),
    ]);
    return buildPagination(items, total, query);
  }

  async findByKey(key: string) {
    const s = await this.prisma.setting.findUnique({ where: { key } });
    if (!s) throw new NotFoundException(`Setting '${key}' not found`);
    return s;
  }

  async getValue<T = unknown>(key: string, defaultValue?: T): Promise<T | undefined> {
    const s = await this.prisma.setting.findUnique({ where: { key } });
    if (!s) return defaultValue;
    return s.value as T;
  }

  async remove(key: string) {
    await this.findByKey(key);
    await this.prisma.setting.delete({ where: { key } });
    return { message: "Setting deleted" };
  }
}
