"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingService = exports.createReportSchema = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const zod_1 = require("zod");
exports.createReportSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    type: zod_1.z.enum(["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]),
    format: zod_1.z.enum(["CSV", "EXCEL", "PDF", "JSON"]).default("CSV"),
    organizationId: zod_1.z.string().uuid().optional(),
    periodStart: zod_1.z.string().datetime(),
    periodEnd: zod_1.z.string().datetime(),
    filters: zod_1.z.record(zod_1.z.unknown()).default({}),
});
let ReportingService = class ReportingService {
    prisma;
    logger = new common_1.Logger("ReportingService");
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createReport(dto, userId) {
        const report = await this.prisma.report.create({
            data: {
                name: dto.name,
                type: dto.type,
                format: dto.format,
                status: "GENERATING",
                organizationId: dto.organizationId,
                requestedBy: userId,
                periodStart: new Date(dto.periodStart),
                periodEnd: new Date(dto.periodEnd),
                filters: dto.filters ?? client_1.Prisma.JsonNull,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        try {
            const data = await this.collectReportData(dto);
            const exportData = this.formatExport(data, dto.format);
            await this.prisma.report.update({
                where: { id: report.id },
                data: {
                    status: "READY",
                    rowCount: Array.isArray(data) ? data.length : 1,
                    fileUrl: exportData.url,
                    fileSize: BigInt(Buffer.byteLength(exportData.content)),
                    generatedAt: new Date(),
                },
            });
            return { reportId: report.id, status: "READY", format: dto.format, data: exportData.content, rowCount: Array.isArray(data) ? data.length : 1 };
        }
        catch (err) {
            await this.prisma.report.update({
                where: { id: report.id },
                data: { status: "FAILED", errorMessage: err.message },
            });
            throw err;
        }
    }
    async getReports(organizationId, limit = 50) {
        const where = {};
        if (organizationId)
            where.organizationId = organizationId;
        return this.prisma.report.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limit,
        });
    }
    async getReport(id) {
        return this.prisma.report.findUnique({ where: { id } });
    }
    async getScheduledReports(organizationId) {
        const where = {};
        if (organizationId)
            where.organizationId = organizationId;
        return this.prisma.scheduledReport.findMany({ where, orderBy: { createdAt: "desc" } });
    }
    async createScheduledReport(dto) {
        return this.prisma.scheduledReport.create({
            data: {
                ...dto,
                type: dto.type,
                format: dto.format,
                filters: dto.filters ?? client_1.Prisma.JsonNull,
                nextRunAt: this.calculateNextRun(dto.cronExpression),
            },
        });
    }
    async deleteScheduledReport(id) {
        await this.prisma.scheduledReport.delete({ where: { id } });
        return { message: "Scheduled report deleted" };
    }
    async collectReportData(dto) {
        const where = {
            periodStart: { gte: new Date(dto.periodStart), lte: new Date(dto.periodEnd) },
        };
        if (dto.organizationId)
            where.organizationId = dto.organizationId;
        return this.prisma.usageRecord.findMany({
            where,
            orderBy: { periodStart: "asc" },
            select: {
                periodStart: true,
                providerName: true,
                modelName: true,
                endpoint: true,
                requestCount: true,
                inputTokens: true,
                outputTokens: true,
                totalTokens: true,
                cost: true,
                latencyMs: true,
                errorCount: true,
                successCount: true,
            },
        });
    }
    formatExport(data, format) {
        switch (format) {
            case "CSV":
                return { content: this.toCSV(data), url: `data:text/csv;base64,${Buffer.from(this.toCSV(data)).toString("base64")}` };
            case "JSON":
                return { content: JSON.stringify(data, null, 2), url: `data:application/json;base64,${Buffer.from(JSON.stringify(data)).toString("base64")}` };
            case "EXCEL":
                return { content: this.toCSV(data), url: `data:application/vnd.ms-excel;base64,${Buffer.from(this.toCSV(data)).toString("base64")}` };
            case "PDF":
                return { content: JSON.stringify(data, null, 2), url: `data:application/pdf;base64,${Buffer.from(JSON.stringify(data)).toString("base64")}` };
            default:
                return { content: JSON.stringify(data), url: "" };
        }
    }
    toCSV(data) {
        if (!data.length)
            return "";
        const first = data[0];
        const headers = Object.keys(first);
        const rows = data.map((row) => {
            const r = row;
            return headers.map((h) => {
                const val = r[h];
                if (val === null || val === undefined)
                    return "";
                if (val instanceof Date)
                    return val.toISOString();
                if (typeof val === "object")
                    return JSON.stringify(val);
                return String(val);
            }).join(",");
        });
        return [headers.join(","), ...rows].join("\n");
    }
    calculateNextRun(cronExpression) {
        void cronExpression;
        return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
};
exports.ReportingService = ReportingService;
exports.ReportingService = ReportingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportingService);
//# sourceMappingURL=reporting.service.js.map