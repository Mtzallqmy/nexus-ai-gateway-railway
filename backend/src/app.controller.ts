import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { Public } from "./common/decorators/public.decorator";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("System")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  root() {
    return this.appService.root();
  }
}
