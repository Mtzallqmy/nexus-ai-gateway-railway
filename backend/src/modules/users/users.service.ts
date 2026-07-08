import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { CreateUserDto, ListUsersQueryDto, UpdateUserDto } from "./dto/user.dto";
import { buildPagination } from "../../common/dto/pagination.dto";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const emailNormalized = dto.email.toLowerCase().trim();
    const data: Prisma.UserCreateInput = {
      email: dto.email,
      emailNormalized,
      name: dto.name,
      jobTitle: dto.jobTitle,
      location: dto.location,
      bio: dto.bio,
      website: dto.website,
      status: "PENDING",
      emailVerified: "UNVERIFIED",
      preferences: Prisma.JsonNull,
    };
    if (dto.password) {
      const bcrypt = await import("bcrypt");
      data.passwordHash = await bcrypt.hash(dto.password, 12);
    }
    const user = await this.prisma.user.create({ data });
    this.logger.log(`User created: ${user.email}`);
    return this.sanitize(user);
  }

  async findAll(query: ListUsersQueryDto) {
    const where: Prisma.UserWhereInput = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.status) where.status = query.status;

    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [query.sortBy]: query.sortOrder,
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select: this.selectFields(),
      }),
      this.prisma.user.count({ where }),
    ]);

    return buildPagination(users, total, query);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.selectFields(),
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { emailNormalized: email.toLowerCase().trim() },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: this.selectFields(),
    });
    this.logger.log(`User updated: ${id}`);
    return user;
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: "INACTIVE" },
    });
    this.logger.log(`User soft-deleted: ${id}`);
    return { message: "User deleted" };
  }

  private selectFields() {
    return {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      jobTitle: true,
      location: true,
      bio: true,
      website: true,
      status: true,
      emailVerified: true,
      twoFactorStatus: true,
      lastLoginAt: true,
      lastActiveAt: true,
      createdAt: true,
      updatedAt: true,
    } satisfies Prisma.UserSelect;
  }

  private sanitize(user: Record<string, unknown>) {
    const { passwordHash: _omit, ...rest } = user;
    void _omit;
    return rest;
  }
}
