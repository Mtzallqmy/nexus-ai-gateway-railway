"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let code = "INTERNAL_ERROR";
        let message = "An unexpected error occurred";
        let details = undefined;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === "string") {
                message = res;
            }
            else if (typeof res === "object" && res !== null) {
                const r = res;
                message = r.message
                    ? Array.isArray(r.message)
                        ? r.message.join("; ")
                        : r.message
                    : exception.message;
                code = r.code ?? exception.name;
                details = r.details;
            }
            if (status >= 500) {
                this.logger.error(`[${request.method}] ${request.url} → ${status}`, exception.stack);
            }
            else {
                this.logger.warn(`[${request.method}] ${request.url} → ${status} ${message}`);
            }
        }
        else if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            const mapped = this.mapPrismaError(exception);
            status = mapped.status;
            code = mapped.code;
            message = mapped.message;
            this.logger.warn(`Prisma error ${exception.code}: ${message}`);
        }
        else if (exception instanceof client_1.Prisma.PrismaClientValidationError) {
            status = common_1.HttpStatus.BAD_REQUEST;
            code = "VALIDATION_ERROR";
            message = "Database validation failed";
            this.logger.warn(`Prisma validation: ${exception.message}`);
        }
        else if (exception instanceof Error) {
            message = exception.message;
            this.logger.error(`[${request.method}] ${request.url} → ${status}`, exception.stack);
        }
        else {
            this.logger.error("Unknown error", exception);
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
    mapPrismaError(err) {
        switch (err.code) {
            case "P2002":
                return {
                    status: common_1.HttpStatus.CONFLICT,
                    code: "DUPLICATE_ENTRY",
                    message: "A record with this value already exists",
                };
            case "P2025":
                return {
                    status: common_1.HttpStatus.NOT_FOUND,
                    code: "NOT_FOUND",
                    message: "Record not found",
                };
            case "P2003":
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    code: "FOREIGN_KEY_VIOLATION",
                    message: "Referenced record does not exist",
                };
            case "P2014":
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    code: "INVALID_RELATION",
                    message: "Invalid relation",
                };
            default:
                return {
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    code: "DATABASE_ERROR",
                    message: `Database error (${err.code})`,
                };
        }
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map