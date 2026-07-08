import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PermissionsService } from "./permissions.service";
import {
  createPermissionSchema,
  listPermissionsQuerySchema,
  type CreatePermissionDto,
  type ListPermissionsQueryDto,
} from "./dto/permission.dto";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Permissions")
@Controller("permissions")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionsController {
  constructor(private readonly perms: PermissionsService) {}

  @Get()
  @RequirePermissions("permissions:read")
  @ApiOperation({ summary: "List permissions (paginated, filterable, searchable)" })
  async findAll(@Query(new ZodValidationPipe(listPermissionsQuerySchema)) query: ListPermissionsQueryDto) {
    return this.perms.findAll(query);
  }

  @Get("grouped")
  @RequirePermissions("permissions:read")
  @ApiOperation({ summary: "List permissions grouped by group field" })
  async grouped() {
    return this.perms.grouped();
  }

  @Get(":id")
  @RequirePermissions("permissions:read")
  async findOne(@Param("id") id: string) {
    return this.perms.findOne(id);
  }

  @Post()
  @RequirePermissions("permissions:write")
  async create(@Body(new ZodValidationPipe(createPermissionSchema)) dto: CreatePermissionDto) {
    return this.perms.create(dto);
  }

  @Post("grant")
  @RequirePermissions("permissions:write")
  @ApiOperation({ summary: "Grant a permission directly to a user" })
  async grant(@Body() body: { userId: string; permissionId: string }) {
    return this.perms.grantToUser(body.userId, body.permissionId);
  }

  @Post("revoke")
  @RequirePermissions("permissions:write")
  async revoke(@Body() body: { userId: string; permissionId: string }) {
    return this.perms.revokeFromUser(body.userId, body.permissionId);
  }

  @Delete(":id")
  @RequirePermissions("permissions:delete")
  async remove(@Param("id") id: string) {
    return this.perms.remove(id);
  }
}
