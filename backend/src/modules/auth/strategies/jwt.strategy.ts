import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { JwtPayload } from "../dto/auth-response.dto";
import type { AuthenticatedUser } from "../../../common/decorators/current-user.decorator";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>("app.jwt.accessSecret") ?? "fallback-secret",
      issuer: config.get<string>("app.jwt.issuer"),
      audience: config.get<string>("app.jwt.audience"),
    });
  }

  /**
   * Called by Passport after JWT is verified — the returned object
   * becomes `request.user`.
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload.sub) {
      throw new UnauthorizedException("Invalid token payload");
    }
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      permissions: payload.permissions ?? [],
      organizationId: payload.organizationId,
      sessionId: payload.sessionId,
    };
  }
}
