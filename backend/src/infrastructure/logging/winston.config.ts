import { WinstonModuleOptions } from "nest-winston";
import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import * as path from "path";

const LOG_DIR = process.env.LOG_DIR ?? path.join(process.cwd(), "logs");

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    const ctx = context ? `[${context as string}] ` : "";
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp as string} ${level} ${ctx}${message as string}${metaStr}`;
  })
);

export function buildWinstonOptions(level: string = "info"): WinstonModuleOptions {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      level,
      format: consoleFormat,
    }),
  ];

  // File rotation (only in non-test)
  if (process.env.NODE_ENV !== "test") {
    transports.push(
      new DailyRotateFile({
        filename: path.join(LOG_DIR, "application-%DATE%.log"),
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "14d",
        level,
        format: logFormat,
      }),
      new DailyRotateFile({
        filename: path.join(LOG_DIR, "error-%DATE%.log"),
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "30d",
        level: "error",
        format: logFormat,
      })
    );
  }

  return {
    transports,
    format: logFormat,
    exitOnError: false,
    defaultMeta: {
      service: process.env.APP_NAME ?? "moataz-ai-gateway",
      version: process.env.APP_VERSION ?? "2.0.0",
    },
  };
}
