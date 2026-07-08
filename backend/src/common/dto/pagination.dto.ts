import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
});

export type PaginationDto = z.infer<typeof paginationSchema>;

/**
 * Looser pagination input accepted by `buildPagination` — allows services
 * to pass their own query DTO shapes (which may have additional fields
 * like `status`, `userId`, etc.) without `sortBy`/`sortOrder` being required.
 */
export interface PaginationInput {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function buildPagination<T>(
  data: T[],
  total: number,
  dto: PaginationInput
): PaginatedResponse<T> {
  const pageSize = dto.pageSize;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const page = dto.page;
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
