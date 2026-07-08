"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWinstonOptions = buildWinstonOptions;
const winston = __importStar(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const path = __importStar(require("path"));
const LOG_DIR = process.env.LOG_DIR ?? path.join(process.cwd(), "logs");
const logFormat = winston.format.combine(winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }), winston.format.errors({ stack: true }), winston.format.splat(), winston.format.json());
const consoleFormat = winston.format.combine(winston.format.timestamp({ format: "HH:mm:ss" }), winston.format.colorize({ all: true }), winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    const ctx = context ? `[${context}] ` : "";
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} ${level} ${ctx}${message}${metaStr}`;
}));
function buildWinstonOptions(level = "info") {
    const transports = [
        new winston.transports.Console({
            level,
            format: consoleFormat,
        }),
    ];
    if (process.env.NODE_ENV !== "test") {
        transports.push(new winston_daily_rotate_file_1.default({
            filename: path.join(LOG_DIR, "application-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            maxSize: "20m",
            maxFiles: "14d",
            level,
            format: logFormat,
        }), new winston_daily_rotate_file_1.default({
            filename: path.join(LOG_DIR, "error-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            maxSize: "20m",
            maxFiles: "30d",
            level: "error",
            format: logFormat,
        }));
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
//# sourceMappingURL=winston.config.js.map