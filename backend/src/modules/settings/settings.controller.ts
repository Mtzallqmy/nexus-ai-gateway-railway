import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { SettingsService } from "./settings.service";
import {
  listSettingsQuerySchema,
  upsertSettingSchema,
  type ListSettingsQueryDto,
  type UpsertSettingDto,
} from "./dto/setting.dto";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Settings")
@Controller("settings")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  @RequirePermissions("settings:read")
  @ApiOperation({ summary: "List settings (paginated, filterable)" })
  async findAll(@Query(new ZodValidationPipe(listSettingsQuerySchema)) query: ListSettingsQueryDto) {
    return this.settings.findAll(query);
  }

  @Get(":key")
  @RequirePermissions("settings:read")
  async findByKey(@Param("key") key: string) {
    return this.settings.findByKey(key);
  }

  @Post()
  @RequirePermissions("settings:write")
  async upsert(
    @Body(new ZodValidationPipe(upsertSettingSchema)) dto: UpsertSettingDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.settings.upsert(dto, user.id);
  }

  @Delete(":key")
  @RequirePermissions("settings:delete")
  async remove(@Param("key") key: string) {
    return this.settings.remove(key);
  }
}
