import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import bcrypt from "bcrypt";
import crypto from "crypto";
import type { AuthenticatedUser } from "../decorators/current-user.decorator";

/**
 * API Key guard — accepts requests with `Authorization: Bearer <api_key>`
 * or `x-api-key: <api_key>` headers.
 *
 * Validates the key against the database and populates request.user with
 * the API key owner (without session info).
 *
 * Phase 2 structure: validates format + hashing pattern.
 * Real DB lookup will be wired in by the ApiKeysService.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers["authorization"] as string | undefined;
    const apiKeyHeader = request.headers["x-api-key"] as string | undefined;

    let apiKey: string | undefined;
    if (authHeader?.startsWith("Bearer ")) {
      apiKey = authHeader.slice(7);
    } else if (apiKeyHeader) {
      apiKey = apiKeyHeader;
    }

    if (!apiKey) {
      throw new UnauthorizedException("API key required");
    }

    const prefix = this.config.get<string>("app.apiKey.prefix") ?? "nx";
    if (!apiKey.startsWith(`${prefix}_`)) {
      throw new UnauthorizedException("Invalid API key format");
    }

    // Phase 2 structure: in production this would call apiKeysService.validate(apiKey)
    // and populate request.user from the DB lookup. For now, we attach a stub.
    const hashed = crypto.createHash("sha256").update(apiKey).digest("hex");
    void bcrypt;
    void hashed;

    request.user = {
      id: "api-key-user",
      email: "api@moataz.local",
      name: "API Key",
      permissions: ["*"],
    } satisfies AuthenticatedUser;

    return true;
  }
}
