import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
  type CreateUserDto,
  type ListUsersQueryDto,
  type UpdateUserDto,
} from "./dto/user.dto";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Users")
@Controller("users")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @RequirePermissions("users:read")
  @ApiOperation({ summary: "List users (paginated, filterable, sortable, searchable)" })
  async findAll(@Query(new ZodValidationPipe(listUsersQuerySchema)) query: ListUsersQueryDto) {
    return this.users.findAll(query);
  }

  @Get(":id")
  @RequirePermissions("users:read")
  @ApiOperation({ summary: "Get a single user by ID" })
  async findOne(@Param("id") id: string) {
    return this.users.findOne(id);
  }

  @Post()
  @RequirePermissions("users:write")
  @ApiOperation({ summary: "Create a new user (admin)" })
  async create(@Body(new ZodValidationPipe(createUserSchema)) dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Patch(":id")
  @RequirePermissions("users:write")
  @ApiOperation({ summary: "Update an existing user" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateUserSchema)) dto: UpdateUserDto
  ) {
    return this.users.update(id, dto);
  }

  @Delete(":id")
  @RequirePermissions("users:delete")
  @ApiOperation({ summary: "Soft-delete a user" })
  async remove(@Param("id") id: string) {
    return this.users.remove(id);
  }
}
