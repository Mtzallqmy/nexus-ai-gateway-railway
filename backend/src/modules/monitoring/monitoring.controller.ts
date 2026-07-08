import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { MonitoringService } from "./monitoring.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Monitoring")
@Controller("monitoring")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MonitoringController {
  constructor(private readonly monitoring: MonitoringService) {}

  @Get("system")
  @RequirePermissions("monitoring:read")
  @ApiOperation({ summary: "System metrics — CPU, RAM, Disk, Network, process" })
  async system() {
    return this.monitoring.getSystemMetrics();
  }

  @Get("services")
  @RequirePermissions("monitoring:read")
  @ApiOperation({ summary: "Service health — PostgreSQL, Redis, LiteLLM, NestJS, Next.js" })
  async services() {
    return this.monitoring.getServiceHealth();
  }

  @Get("dashboard")
  @RequirePermissions("monitoring:read")
  @ApiOperation({ summary: "Health dashboard — system + services + recent metrics" })
  async dashboard() {
    return this.monitoring.getHealthDashboard();
  }

  @Get("integrations")
  @RequirePermissions("monitoring:read")
  @ApiOperation({ summary: "External integration status — Grafana, Prometheus, Uptime Kuma" })
  async integrations() {
    return this.monitoring.getIntegrationStatus();
  }

  @Get("metrics")
  @RequirePermissions("monitoring:read")
  @ApiOperation({ summary: "Recent system metrics from database" })
  async metrics() {
    return this.monitoring.getRecentMetrics();
  }

  @Post("metrics")
  @RequirePermissions("monitoring:write")
  async recordMetric(@Body() body: { name: string; value: number; unit?: string; labels?: Record<string, unknown> }) {
    await this.monitoring.recordMetric(body.name, body.value, body.unit, body.labels);
    return { message: "Metric recorded" };
  }
}
