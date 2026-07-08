import { z } from "zod";
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodString;
    name: z.ZodString;
    password: z.ZodOptional<z.ZodString>;
    jobTitle: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    role?: string | undefined;
    password?: string | undefined;
    jobTitle?: string | undefined;
    location?: string | undefined;
    bio?: string | undefined;
    website?: string | undefined;
}, {
    name: string;
    email: string;
    role?: string | undefined;
    password?: string | undefined;
    jobTitle?: string | undefined;
    location?: string | undefined;
    bio?: string | undefined;
    website?: string | undefined;
}>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
export declare const updateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    jobTitle: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING" | undefined;
    avatarUrl?: string | undefined;
    jobTitle?: string | undefined;
    location?: string | undefined;
    bio?: string | undefined;
    website?: string | undefined;
}, {
    name?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING" | undefined;
    avatarUrl?: string | undefined;
    jobTitle?: string | undefined;
    location?: string | undefined;
    bio?: string | undefined;
    website?: string | undefined;
}>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export declare const listUsersQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]>>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "name", "email", "lastLoginAt"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    sortBy: "name" | "email" | "lastLoginAt" | "createdAt";
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING" | undefined;
}, {
    search?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING" | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    sortBy?: "name" | "email" | "lastLoginAt" | "createdAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type ListUsersQueryDto = z.infer<typeof listUsersQuerySchema>;
