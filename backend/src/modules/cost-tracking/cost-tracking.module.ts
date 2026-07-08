import { Module } from "@nestjs/common";
import { CostTrackingController } from "./cost-tracking.controller";
import { CostTrackingService } from "./cost-tracking.service";

@Module({
  controllers: [CostTrackingController],
  providers: [CostTrackingService],
  exports: [CostTrackingService],
})
export class CostTrackingModule {}
