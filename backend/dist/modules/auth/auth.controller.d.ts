import { AuthService } from "./auth.service";
import { type ChangePasswordDto, type Disable2faDto, type Enable2faDto, type ForgotPasswordDto, type LoginDto, type RefreshTokenDto, type RegisterDto, type ResetPasswordDto, type VerifyEmailDto } from "./dto/auth.dto";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto): Promise<{
        userId: string;
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            name: string;
            id: string;
            email: string;
            permissions: string[];
            emailVerified: boolean;
            twoFactorEnabled: boolean;
            role?: string | undefined;
            avatarUrl?: string | null | undefined;
        };
        refreshToken: string;
        accessToken: string;
        expiresIn: number;
        tokenType: "Bearer";
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        user: {
            name: string;
            id: string;
            email: string;
            permissions: string[];
            emailVerified: boolean;
            twoFactorEnabled: boolean;
            role?: string | undefined;
            avatarUrl?: string | null | undefined;
        };
        refreshToken: string;
        accessToken: string;
        expiresIn: number;
        tokenType: "Bearer";
    }>;
    logout(refreshToken?: string): Promise<{
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    resendVerification(email: string): Promise<{
        message: string;
    }>;
    changePassword(user: AuthenticatedUser, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    enable2fa(user: AuthenticatedUser, dto: Enable2faDto): Promise<{
        secret: string;
        qrUrl: string;
        backupCodes: string[];
    }>;
    disable2fa(user: AuthenticatedUser, _dto: Disable2faDto): Promise<{
        message: string;
    }>;
    me(user: AuthenticatedUser): Promise<{
        user: AuthenticatedUser;
    }>;
}
