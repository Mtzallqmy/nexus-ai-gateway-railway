import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesService } from "./roles.service";
import {
  createRoleSchema,
  listRolesQuerySchema,
  updateRoleSchema,
  type CreateRoleDto,
  type ListRolesQueryDto,
  type UpdateRoleDto,
} from "./dto/role.dto";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Roles")
@Controller("roles")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get()
  @RequirePermissions("roles:read")
  @ApiOperation({ summary: "List roles (paginated, filterable, searchable)" })
  async findAll(@Query(new ZodValidationPipe(listRolesQuerySchema)) query: ListRolesQueryDto) {
    return this.roles.findAll(query);
  }

  @Get(":id")
  @RequirePermissions("roles:read")
  async findOne(@Param("id") id: string) {
    return this.roles.findOne(id);
  }

  @Post()
  @RequirePermissions("roles:write")
  async create(@Body(new ZodValidationPipe(createRoleSchema)) dto: CreateRoleDto) {
    return this.roles.create(dto);
  }

  @Patch(":id")
  @RequirePermissions("roles:write")
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateRoleSchema)) dto: UpdateRoleDto
  ) {
    return this.roles.update(id, dto);
  }

  @Delete(":id")
  @RequirePermissions("roles:delete")
  async remove(@Param("id") id: string) {
    return this.roles.remove(id);
  }
}
