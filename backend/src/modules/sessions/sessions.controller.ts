import { Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { SessionsService } from "./sessions.service";
import { listSessionsQuerySchema, type ListSessionsQueryDto } from "./dto/session.dto";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Sessions")
@Controller("sessions")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Get()
  @RequirePermissions("sessions:read")
  @ApiOperation({ summary: "List sessions (paginated, filterable)" })
  async findAll(@Query(new ZodValidationPipe(listSessionsQuerySchema)) query: ListSessionsQueryDto) {
    return this.sessions.findAll(query);
  }

  @Get(":id")
  @RequirePermissions("sessions:read")
  async findOne(@Param("id") id: string) {
    return this.sessions.findOne(id);
  }

  @Post(":id/revoke")
  @RequirePermissions("sessions:write")
  async revoke(@Param("id") id: string, @Param("reason") reason?: string) {
    return this.sessions.revoke(id, reason);
  }

  @Delete("me/all")
  @RequirePermissions("sessions:write")
  @ApiOperation({ summary: "Revoke all my other active sessions" })
  async revokeAllMine(@CurrentUser() user: AuthenticatedUser) {
    return this.sessions.revokeAllForUser(user.id);
  }
}
