import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { OrganizationsService } from "./organizations.service";
import {
  createOrgSchema,
  listOrgsQuerySchema,
  updateOrgSchema,
  type CreateOrgDto,
  type ListOrgsQueryDto,
  type UpdateOrgDto,
} from "./dto/org.dto";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Organizations")
@Controller("organizations")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrganizationsController {
  constructor(private readonly orgs: OrganizationsService) {}

  @Get()
  @RequirePermissions("organizations:read")
  @ApiOperation({ summary: "List organizations (paginated, filterable, sortable, searchable)" })
  async findAll(@Query(new ZodValidationPipe(listOrgsQuerySchema)) query: ListOrgsQueryDto) {
    return this.orgs.findAll(query);
  }

  @Get(":id")
  @RequirePermissions("organizations:read")
  @ApiOperation({ summary: "Get a single organization by ID" })
  async findOne(@Param("id") id: string) {
    return this.orgs.findOne(id);
  }

  @Post()
  @RequirePermissions("organizations:write")
  @ApiOperation({ summary: "Create a new organization" })
  async create(
    @Body(new ZodValidationPipe(createOrgSchema)) dto: CreateOrgDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.orgs.create(dto, user.id);
  }

  @Patch(":id")
  @RequirePermissions("organizations:write")
  @ApiOperation({ summary: "Update an organization" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateOrgSchema)) dto: UpdateOrgDto
  ) {
    return this.orgs.update(id, dto);
  }

  @Delete(":id")
  @RequirePermissions("organizations:delete")
  @ApiOperation({ summary: "Soft-delete an organization" })
  async remove(@Param("id") id: string) {
    return this.orgs.remove(id);
  }
}
