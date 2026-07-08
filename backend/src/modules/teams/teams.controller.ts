import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { TeamsService } from "./teams.service";
import {
  createTeamSchema,
  listTeamsQuerySchema,
  updateTeamSchema,
  type CreateTeamDto,
  type ListTeamsQueryDto,
  type UpdateTeamDto,
} from "./dto/team.dto";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Teams")
@Controller("teams")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TeamsController {
  constructor(private readonly teams: TeamsService) {}

  @Get()
  @RequirePermissions("teams:read")
  @ApiOperation({ summary: "List teams (paginated, filterable, sortable, searchable)" })
  async findAll(@Query(new ZodValidationPipe(listTeamsQuerySchema)) query: ListTeamsQueryDto) {
    return this.teams.findAll(query);
  }

  @Get(":id")
  @RequirePermissions("teams:read")
  async findOne(@Param("id") id: string) {
    return this.teams.findOne(id);
  }

  @Post()
  @RequirePermissions("teams:write")
  async create(
    @Body(new ZodValidationPipe(createTeamSchema)) dto: CreateTeamDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.teams.create(dto, user.id);
  }

  @Patch(":id")
  @RequirePermissions("teams:write")
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateTeamSchema)) dto: UpdateTeamDto
  ) {
    return this.teams.update(id, dto);
  }

  @Delete(":id")
  @RequirePermissions("teams:delete")
  async remove(@Param("id") id: string) {
    return this.teams.remove(id);
  }
}
