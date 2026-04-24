import api from "./axios";
import type { User, PublicProfile } from "@/lib/types/user.types";
import type { ApiResponse } from "@/lib/types/api.types";

export const usersApi = {
  getMe: () =>
    api.get<ApiResponse<User>>("/users/me"),

  updateMe: (data: FormData | { name?: string; bio?: string; skills?: string[]; avatarUrl?: string }) => {
    return api.patch<ApiResponse<User>>("/users/me", data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
  },

  getPublicProfile: (id: string) =>
    api.get<ApiResponse<PublicProfile>>(`/users/${id}`),

  getUserReviews: (id: string, params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<any>>(`/users/${id}/reviews`, { params }),
};
