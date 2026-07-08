import { z } from "zod";
export declare const loginResponseSchema: z.ZodObject<{
    accessToken: z.ZodString;
    refreshToken: z.ZodString;
    expiresIn: z.ZodNumber;
    tokenType: z.ZodLiteral<"Bearer">;
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        avatarUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        role: z.ZodOptional<z.ZodString>;
        permissions: z.ZodArray<z.ZodString, "many">;
        emailVerified: z.ZodBoolean;
        twoFactorEnabled: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        email: string;
        permissions: string[];
        emailVerified: boolean;
        twoFactorEnabled: boolean;
        role?: string | undefined;
        avatarUrl?: string | null | undefined;
    }, {
        name: string;
        id: string;
        email: string;
        permissions: string[];
        emailVerified: boolean;
        twoFactorEnabled: boolean;
        role?: string | undefined;
        avatarUrl?: string | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
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
}, {
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
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export interface JwtPayload {
    sub: string;
    email: string;
    name: string;
    role?: string;
    permissions?: string[];
    sessionId?: string;
    organizationId?: string;
    iat?: number;
    exp?: number;
    iss?: string;
    aud?: string;
}
