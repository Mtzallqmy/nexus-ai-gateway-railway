import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { HealthService } from "./health.service";
import { Public } from "../../common/decorators/public.decorator";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Public()
  @Get("live")
  @ApiOperation({ summary: "Liveness probe — process is alive" })
  async liveness() {
    return this.health.liveness();
  }

  @Public()
  @Get("ready")
  @ApiOperation({ summary: "Readiness probe — all dependencies are reachable" })
  async readiness() {
    return this.health.readiness();
  }

  @Public()
  @Get()
  @ApiOperation({ summary: "Full health check with service details" })
  async check() {
    return this.health.check();
  }
}
