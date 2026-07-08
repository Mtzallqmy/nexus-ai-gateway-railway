import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { CreateTeamDto, ListTeamsQueryDto, UpdateTeamDto } from "./dto/team.dto";
import { buildPagination } from "../../common/dto/pagination.dto";

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTeamDto, ownerId: string) {
    const slug = dto.slug ?? this.slugify(dto.name);
    const team = await this.prisma.team.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        organizationId: dto.organizationId,
        ownerId,
      },
    });
    return team;
  }

  async findAll(query: ListTeamsQueryDto) {
    const where: Prisma.TeamWhereInput = {};
    if (query.organizationId) where.organizationId = query.organizationId;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { slug: { contains: query.search, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.team.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.team.count({ where }),
    ]);
    return buildPagination(items, total, query);
  }

  async findOne(id: string) {
    const t = await this.prisma.team.findUnique({ where: { id } });
    if (!t) throw new NotFoundException(`Team ${id} not found`);
    return t;
  }

  async update(id: string, dto: UpdateTeamDto) {
    await this.findOne(id);
    return this.prisma.team.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.team.update({
      where: { id },
      data: { deletedAt: new Date(), status: "INACTIVE" },
    });
    return { message: "Team deleted" };
  }

  private slugify(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "team";
  }
}
