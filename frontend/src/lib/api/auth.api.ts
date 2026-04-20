import api from "./axios";
import type { User, AuthTokens } from "@/lib/types/user.types";
import type { ApiResponse } from "@/lib/types/api.types";

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<AuthTokens>>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthTokens>>("/auth/login", data),

  googleOneTap: (credential: string) =>
    api.post<ApiResponse<AuthTokens>>("/auth/google-one-tap", { credential }),

  refresh: () =>
    api.post<ApiResponse<{ accessToken: string }>>("/auth/refresh-token"),

  logout: () =>
    api.post<ApiResponse<null>>("/auth/logout"),

  getMe: () =>
    api.get<ApiResponse<User>>("/users/me"),
};
