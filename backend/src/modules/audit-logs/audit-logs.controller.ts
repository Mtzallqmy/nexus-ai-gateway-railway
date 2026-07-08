import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuditLogsService } from "./audit-logs.service";
import { listAuditLogsQuerySchema, type ListAuditLogsQueryDto } from "./dto/audit-log.dto";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Audit Logs")
@Controller("audit-logs")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditLogsController {
  constructor(private readonly audit: AuditLogsService) {}

  @Get()
  @RequirePermissions("audit:read")
  @ApiOperation({ summary: "List audit logs (paginated, filterable, sortable, searchable)" })
  async findAll(@Query(new ZodValidationPipe(listAuditLogsQuerySchema)) query: ListAuditLogsQueryDto) {
    return this.audit.findAll(query);
  }
}
