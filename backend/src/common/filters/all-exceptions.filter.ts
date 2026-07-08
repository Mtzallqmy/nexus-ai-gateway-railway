import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";

/**
 * Global exception filter — converts all thrown errors into a consistent
 * JSON response shape with logging.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "INTERNAL_ERROR";
    let message = "An unexpected error occurred";
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === "string") {
        message = res;
      } else if (typeof res === "object" && res !== null) {
        const r = res as Record<string, unknown>;
        message = (r.message as string | string[] | undefined)
          ? Array.isArray(r.message)
            ? r.message.join("; ")
            : (r.message as string)
          : exception.message;
        code = (r.code as string) ?? exception.name;
        details = r.details;
      }
      if (status >= 500) {
        this.logger.error(`[${request.method}] ${request.url} → ${status}`, exception.stack);
      } else {
        this.logger.warn(`[${request.method}] ${request.url} → ${status} ${message}`);
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = this.mapPrismaError(exception);
      status = mapped.status;
      code = mapped.code;
      message = mapped.message;
      this.logger.warn(`Prisma error ${exception.code}: ${message}`);
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      code = "VALIDATION_ERROR";
      message = "Database validation failed";
      this.logger.warn(`Prisma validation: ${exception.message}`);
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`[${request.method}] ${request.url} → ${status}`, exception.stack);
    } else {
      this.logger.error("Unknown error", exception as object);
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private mapPrismaError(
    err: Prisma.PrismaClientKnownRequestError
  ): { status: number; code: string; message: string } {
    switch (err.code) {
      case "P2002":
        return {
          status: HttpStatus.CONFLICT,
          code: "DUPLICATE_ENTRY",
          message: "A record with this value already exists",
        };
      case "P2025":
        return {
          status: HttpStatus.NOT_FOUND,
          code: "NOT_FOUND",
          message: "Record not found",
        };
      case "P2003":
        return {
          status: HttpStatus.BAD_REQUEST,
          code: "FOREIGN_KEY_VIOLATION",
          message: "Referenced record does not exist",
        };
      case "P2014":
        return {
          status: HttpStatus.BAD_REQUEST,
          code: "INVALID_RELATION",
          message: "Invalid relation",
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          code: "DATABASE_ERROR",
          message: `Database error (${err.code})`,
        };
    }
  }
}
