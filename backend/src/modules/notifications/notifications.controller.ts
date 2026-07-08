import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { NotificationsService } from "./notifications.service";
import {
  createNotificationSchema,
  listNotificationsQuerySchema,
  type CreateNotificationDto,
  type ListNotificationsQueryDto,
} from "./dto/notification.dto";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotificationsController {
  constructor(private readonly notifs: NotificationsService) {}

  @Get()
  @RequirePermissions("notifications:read")
  @ApiOperation({ summary: "List notifications (paginated, filterable)" })
  async findAll(@Query(new ZodValidationPipe(listNotificationsQuerySchema)) query: ListNotificationsQueryDto) {
    return this.notifs.findAll(query);
  }

  @Get("unread/count")
  @RequirePermissions("notifications:read")
  async unreadCount(@CurrentUser() user: AuthenticatedUser) {
    return this.notifs.unreadCount(user.id);
  }

  @Get(":id")
  @RequirePermissions("notifications:read")
  async findOne(@Param("id") _id: string) {
    return this.notifs.findAll({ page: 1, pageSize: 1, userId: undefined }).then((r) => r.data[0]);
  }

  @Post()
  @RequirePermissions("notifications:write")
  async create(@Body(new ZodValidationPipe(createNotificationSchema)) dto: CreateNotificationDto) {
    return this.notifs.create(dto);
  }

  @Post(":id/read")
  @RequirePermissions("notifications:write")
  async markRead(@Param("id") id: string) {
    return this.notifs.markRead(id);
  }

  @Post("read/all")
  @RequirePermissions("notifications:write")
  async markAllRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notifs.markAllRead(user.id);
  }

  @Delete(":id")
  @RequirePermissions("notifications:delete")
  async remove(@Param("id") id: string) {
    return this.notifs.remove(id);
  }
}
