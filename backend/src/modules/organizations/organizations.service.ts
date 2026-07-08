import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { CreateOrgDto, ListOrgsQueryDto, UpdateOrgDto } from "./dto/org.dto";
import { buildPagination } from "../../common/dto/pagination.dto";

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrgDto, ownerId: string) {
    const slug = dto.slug ?? this.slugify(dto.name);
    const uniqueSlug = await this.uniqueSlug(slug);
    const org = await this.prisma.organization.create({
      data: {
        name: dto.name,
        slug: uniqueSlug,
        description: dto.description,
        logoUrl: dto.logoUrl,
        ownerId,
        plan: dto.plan,
      },
    });
    // Auto-create owner membership
    await this.prisma.membership.create({
      data: {
        userId: ownerId,
        organizationId: org.id,
        role: "OWNER",
        status: "active",
        acceptedAt: new Date(),
      },
    });
    this.logger.log(`Org created: ${org.slug} (owner=${ownerId})`);
    return org;
  }

  async findAll(query: ListOrgsQueryDto) {
    const where: Prisma.OrganizationWhereInput = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { slug: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.status) where.status = query.status;

    const [items, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.organization.count({ where }),
    ]);
    return buildPagination(items, total, query);
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) throw new NotFoundException(`Organization ${id} not found`);
    return org;
  }

  async findBySlug(slug: string) {
    return this.prisma.organization.findUnique({ where: { slug } });
  }

  async update(id: string, dto: UpdateOrgDto) {
    await this.findOne(id);
    return this.prisma.organization.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.organization.update({
      where: { id },
      data: { deletedAt: new Date(), status: "INACTIVE" },
    });
    return { message: "Organization deleted" };
  }

  private slugify(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "org";
  }

  private async uniqueSlug(base: string): Promise<string> {
    let candidate = base;
    let n = 1;
    while (await this.prisma.organization.findUnique({ where: { slug: candidate } })) {
      candidate = `${base}-${++n}`;
    }
    return candidate;
  }
}
