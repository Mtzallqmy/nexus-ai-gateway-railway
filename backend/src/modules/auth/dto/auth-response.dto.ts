import { z } from "zod";

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  tokenType: z.literal("Bearer"),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    avatarUrl: z.string().nullable().optional(),
    role: z.string().optional(),
    permissions: z.array(z.string()),
    emailVerified: z.boolean(),
    twoFactorEnabled: z.boolean(),
  }),
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;

export interface JwtPayload {
  sub: string; // user id
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
