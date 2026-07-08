import { Body, Controller, Get, HttpCode, Post, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import {
  changePasswordSchema,
  disable2faSchema,
  enable2faSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  type ChangePasswordDto,
  type Disable2faDto,
  type Enable2faDto,
  type ForgotPasswordDto,
  type LoginDto,
  type RefreshTokenDto,
  type RegisterDto,
  type ResetPasswordDto,
  type VerifyEmailDto,
} from "./dto/auth.dto";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("register")
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: "Register a new user account" })
  async register(
    @Body(new ZodValidationPipe(registerSchema)) dto: RegisterDto
  ): Promise<{ userId: string; message: string }> {
    return this.auth.register(dto);
  }

  @Public()
  @Post("login")
  @HttpCode(200)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: "Sign in with email and password" })
  async login(@Body(new ZodValidationPipe(loginSchema)) dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Public()
  @Post("refresh")
  @HttpCode(200)
  @ApiOperation({ summary: "Exchange refresh token for new access token" })
  async refresh(
    @Body(new ZodValidationPipe(refreshTokenSchema)) dto: RefreshTokenDto
  ) {
    return this.auth.refreshTokens(dto.refreshToken);
  }

  @Public()
  @Post("logout")
  @HttpCode(200)
  @ApiOperation({ summary: "Revoke the current session" })
  async logout(@Body("refreshToken") refreshToken?: string) {
    return this.auth.logout(refreshToken);
  }

  @Public()
  @Post("forgot-password")
  @HttpCode(200)
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @ApiOperation({ summary: "Request a password reset link" })
  async forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordSchema)) dto: ForgotPasswordDto
  ) {
    return this.auth.forgotPassword(dto);
  }

  @Public()
  @Post("reset-password")
  @HttpCode(200)
  @ApiOperation({ summary: "Reset password using a reset token" })
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) dto: ResetPasswordDto
  ) {
    return this.auth.resetPassword(dto);
  }

  @Public()
  @Post("verify-email")
  @HttpCode(200)
  @ApiOperation({ summary: "Verify an email address with a token" })
  async verifyEmail(
    @Body(new ZodValidationPipe(verifyEmailSchema)) dto: VerifyEmailDto
  ) {
    return this.auth.verifyEmail(dto);
  }

  @Public()
  @Post("resend-verification")
  @HttpCode(200)
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @ApiOperation({ summary: "Resend the email verification link" })
  async resendVerification(@Body("email") email: string) {
    return this.auth.requestEmailVerification(email);
  }

  @UseGuards(JwtAuthGuard)
  @Post("change-password")
  @HttpCode(200)
  @ApiOperation({ summary: "Change password (requires authentication)" })
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(changePasswordSchema)) dto: ChangePasswordDto
  ) {
    return this.auth.changePassword(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("2fa/enable")
  @ApiOperation({ summary: "Enable two-factor authentication" })
  async enable2fa(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(enable2faSchema)) dto: Enable2faDto
  ) {
    return this.auth.enable2fa(user.id, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post("2fa/disable")
  @ApiOperation({ summary: "Disable two-factor authentication" })
  async disable2fa(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(disable2faSchema)) _dto: Disable2faDto
  ) {
    return this.auth.disable2fa(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  @ApiOperation({ summary: "Get the current authenticated user" })
  async me(@CurrentUser() user: AuthenticatedUser) {
    return { user };
  }
}
