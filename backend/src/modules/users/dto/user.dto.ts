import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email().toLowerCase(),
  name: z.string().min(2).max(100),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .optional(),
  jobTitle: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(2000).optional(),
  website: z.string().url().optional(),
  role: z.string().optional(),
});
export type CreateUserDto = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  jobTitle: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(2000).optional(),
  website: z.string().url().optional(),
  avatarUrl: z.string().url().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]).optional(),
});
export type UpdateUserDto = z.infer<typeof updateUserSchema>;

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]).optional(),
  sortBy: z.enum(["createdAt", "name", "email", "lastLoginAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
export type ListUsersQueryDto = z.infer<typeof listUsersQuerySchema>;
