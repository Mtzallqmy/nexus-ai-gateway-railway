import { ConfigService } from "@nestjs/config";
import { Strategy } from "passport-jwt";
import type { JwtPayload } from "../dto/auth-response.dto";
import type { AuthenticatedUser } from "../../../common/decorators/current-user.decorator";
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(config: ConfigService);
    validate(payload: JwtPayload): Promise<AuthenticatedUser>;
}
export {};
