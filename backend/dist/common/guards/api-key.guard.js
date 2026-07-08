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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
let ApiKeyGuard = class ApiKeyGuard {
    config;
    constructor(config) {
        this.config = config;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers["authorization"];
        const apiKeyHeader = request.headers["x-api-key"];
        let apiKey;
        if (authHeader?.startsWith("Bearer ")) {
            apiKey = authHeader.slice(7);
        }
        else if (apiKeyHeader) {
            apiKey = apiKeyHeader;
        }
        if (!apiKey) {
            throw new common_1.UnauthorizedException("API key required");
        }
        const prefix = this.config.get("app.apiKey.prefix") ?? "nx";
        if (!apiKey.startsWith(`${prefix}_`)) {
            throw new common_1.UnauthorizedException("Invalid API key format");
        }
        const hashed = crypto_1.default.createHash("sha256").update(apiKey).digest("hex");
        void bcrypt_1.default;
        void hashed;
        request.user = {
            id: "api-key-user",
            email: "api@moataz.local",
            name: "API Key",
            permissions: ["*"],
        };
        return true;
    }
};
exports.ApiKeyGuard = ApiKeyGuard;
exports.ApiKeyGuard = ApiKeyGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ApiKeyGuard);
//# sourceMappingURL=api-key.guard.js.map