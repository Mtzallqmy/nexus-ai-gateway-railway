import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiKeysService } from "./api-keys.service";
import {
  createApiKeySchema,
  listApiKeysQuerySchema,
  type CreateApiKeyDto,
  type ListApiKeysQueryDto,
} from "./dto/api-key.dto";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@ApiTags("API Keys")
@Controller("api-keys")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ApiKeysController {
  constructor(private readonly keys: ApiKeysService) {}

  @Get()
  @RequirePermissions("api-keys:read")
  @ApiOperation({ summary: "List API keys (paginated, filterable, searchable)" })
  async findAll(@Query(new ZodValidationPipe(listApiKeysQuerySchema)) query: ListApiKeysQueryDto) {
    return this.keys.findAll(query);
  }

  @Get(":id")
  @RequirePermissions("api-keys:read")
  async findOne(@Param("id") id: string) {
    return this.keys.findOne(id);
  }

  @Post()
  @RequirePermissions("api-keys:write")
  @ApiOperation({ summary: "Create a new API key (raw key only returned once)" })
  async create(
    @Body(new ZodValidationPipe(createApiKeySchema)) dto: CreateApiKeyDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.keys.create(dto, user.id);
  }

  @Post(":id/rotate")
  @RequirePermissions("api-keys:write")
  @ApiOperation({ summary: "Rotate an API key (revokes old, returns new)" })
  async rotate(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.keys.rotate(id, user.id);
  }

  @Post(":id/revoke")
  @RequirePermissions("api-keys:write")
  @ApiOperation({ summary: "Revoke an API key" })
  async revoke(@Param("id") id: string, @Body("reason") reason?: string) {
    return this.keys.revoke(id, reason);
  }

  @Delete(":id")
  @RequirePermissions("api-keys:delete")
  async remove(@Param("id") id: string) {
    return this.keys.remove(id);
  }
}
