import { Module, Global } from "@nestjs/common";
import { WinstonModule } from "nest-winston";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { buildWinstonOptions } from "./winston.config";

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const level = config.get<string>("app.logLevel") ?? "info";
        return buildWinstonOptions(level);
      },
    }),
  ],
  exports: [WinstonModule],
})
export class LoggingModule {}
