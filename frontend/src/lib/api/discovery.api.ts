import api from "./axios";

export const discoveryApi = {
  getHomeData: () => api.get("/discovery/home"),
};
