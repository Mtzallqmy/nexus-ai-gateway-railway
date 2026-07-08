import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ProjectsService } from "./projects.service";
import {
  createProjectSchema,
  listProjectsQuerySchema,
  updateProjectSchema,
  type CreateProjectDto,
  type ListProjectsQueryDto,
  type UpdateProjectDto,
} from "./dto/project.dto";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Projects")
@Controller("projects")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  @RequirePermissions("projects:read")
  @ApiOperation({ summary: "List projects (paginated, filterable, sortable, searchable)" })
  async findAll(@Query(new ZodValidationPipe(listProjectsQuerySchema)) query: ListProjectsQueryDto) {
    return this.projects.findAll(query);
  }

  @Get(":id")
  @RequirePermissions("projects:read")
  async findOne(@Param("id") id: string) {
    return this.projects.findOne(id);
  }

  @Post()
  @RequirePermissions("projects:write")
  async create(
    @Body(new ZodValidationPipe(createProjectSchema)) dto: CreateProjectDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.projects.create(dto, user.id);
  }

  @Patch(":id")
  @RequirePermissions("projects:write")
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateProjectSchema)) dto: UpdateProjectDto
  ) {
    return this.projects.update(id, dto);
  }

  @Delete(":id")
  @RequirePermissions("projects:delete")
  async remove(@Param("id") id: string) {
    return this.projects.remove(id);
  }
}
