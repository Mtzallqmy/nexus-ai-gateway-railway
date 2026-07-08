import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { RedisService } from "../../infrastructure/redis/redis.service";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
import type { ChangePasswordDto, ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto, VerifyEmailDto } from "./dto/auth.dto";
import type { LoginResponse } from "./dto/auth-response.dto";
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    private readonly redis;
    private readonly logger;
    private readonly bcryptRounds;
    private readonly accessExpiresIn;
    private readonly refreshExpiresInDays;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService, redis: RedisService);
    register(dto: RegisterDto): Promise<{
        userId: string;
        message: string;
    }>;
    login(dto: LoginDto): Promise<LoginResponse>;
    refreshTokens(refreshToken: string): Promise<LoginResponse>;
    logout(refreshToken?: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    requestEmailVerification(email: string): Promise<{
        message: string;
    }>;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    enable2fa(userId: string, _password: string): Promise<{
        secret: string;
        qrUrl: string;
        backupCodes: string[];
    }>;
    disable2fa(userId: string): Promise<{
        message: string;
    }>;
    private recordFailedLogin;
    private resolveUserPermissions;
    private uniqueOrgSlug;
    buildAuthenticatedUser(userId: string): Promise<AuthenticatedUser | null>;
}
