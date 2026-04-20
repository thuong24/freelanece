import { APP_CONSTANTS } from "../constants/app.constants";
import { PaginationMeta } from "../response/api-response";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

// Parse và validate query params phân trang từ request
export const getPaginationParams = (query: {
  page?: unknown;
  limit?: unknown;
  sortBy?: unknown;
  sortOrder?: unknown;
}): PaginationParams => {
  const page = Math.max(1, parseInt(String(query.page ?? 1)) || 1);
  const rawLimit = parseInt(String(query.limit ?? APP_CONSTANTS.DEFAULT_LIMIT)) || APP_CONSTANTS.DEFAULT_LIMIT;
  const limit = Math.min(rawLimit, APP_CONSTANTS.MAX_LIMIT);
  const skip = (page - 1) * limit;
  const sortBy = String(query.sortBy ?? "createdAt");
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  return { page, limit, skip, sortBy, sortOrder };
};

// Tạo meta object phân trang để đính kèm vào response
export const buildPaginationMeta = (
  total: number,
  params: PaginationParams
): PaginationMeta => ({
  page: params.page,
  limit: params.limit,
  total,
  totalPages: Math.ceil(total / params.limit),
});
