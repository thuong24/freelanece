import api from "./axios";
import type { User, PublicProfile } from "@/lib/types/user.types";
import type { ApiResponse } from "@/lib/types/api.types";

export const usersApi = {
  getMe: () =>
    api.get<ApiResponse<User>>("/users/me"),

  updateMe: (data: { name?: string; bio?: string; skills?: string[]; avatarUrl?: string }) =>
    api.patch<ApiResponse<User>>("/users/me", data),

  getPublicProfile: (id: string) =>
    api.get<ApiResponse<PublicProfile>>(`/users/${id}`),

  getUserReviews: (id: string, params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<any>>(`/users/${id}/reviews`, { params }),
};
