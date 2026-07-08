import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import { appConfig } from "./configuration";

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: [".env", `.env.${process.env.NODE_ENV ?? "development"}`],
      cache: true,
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
