import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../api/users.api";
import { QUERY_KEYS } from "./queryKeys";

export const usePublicProfile = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.user(id),
    queryFn: async () => {
      const res = await usersApi.getPublicProfile(id);
      return res.data.data;
    },
    enabled: !!id,
  });
};

export const useUserReviews = (id: string, params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["users", id, "reviews", params],
    queryFn: async () => {
      const res = await usersApi.getUserReviews(id, params);
      return res.data;
    },
    enabled: !!id,
  });
};
