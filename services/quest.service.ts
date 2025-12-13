import axiosInstance from "./http";

export const questService = {
  getQuestOverview: async () => axiosInstance.get("/quest/dashboard/overview"),
  getQuestStatsByPeriod: async (period: string) =>
    axiosInstance.get("/quest/dashboard/stats", {
      params: { period },
    }),
};
