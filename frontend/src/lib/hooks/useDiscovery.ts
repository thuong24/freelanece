import { useQuery } from "@tanstack/react-query";
import { discoveryApi } from "../api/discovery.api";
import { QUERY_KEYS } from "./queryKeys";

export const useHomeData = () => {
  return useQuery({
    queryKey: QUERY_KEYS.discoveryHome,
    queryFn: async () => {
      const res = await discoveryApi.getHomeData();
      return res.data.data;
    },
  });
};
