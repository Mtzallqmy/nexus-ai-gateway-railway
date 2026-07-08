import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { CreateProjectDto, ListProjectsQueryDto, UpdateProjectDto } from "./dto/project.dto";
import { buildPagination } from "../../common/dto/pagination.dto";

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto, ownerId: string) {
    const slug = dto.slug ?? this.slugify(dto.name);
    return this.prisma.project.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        organizationId: dto.organizationId,
        teamId: dto.teamId,
        ownerId,
        metadata: (dto.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });
  }

  async findAll(query: ListProjectsQueryDto) {
    const where: Prisma.ProjectWhereInput = {};
    if (query.organizationId) where.organizationId = query.organizationId;
    if (query.teamId) where.teamId = query.teamId;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { slug: { contains: query.search, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.project.count({ where }),
    ]);
    return buildPagination(items, total, query);
  }

  async findOne(id: string) {
    const p = await this.prisma.project.findUnique({ where: { id } });
    if (!p) throw new NotFoundException(`Project ${id} not found`);
    return p;
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id);
    const { metadata, ...rest } = dto;
    const data: Prisma.ProjectUpdateInput = { ...rest };
    if (metadata) data.metadata = metadata as Prisma.InputJsonValue;
    return this.prisma.project.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date(), status: "DELETED" },
    });
    return { message: "Project deleted" };
  }

  private slugify(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "project";
  }
}
