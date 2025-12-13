import axiosInstance from "./http";

export const progressService = {
  getActivityOverview: async () =>
    axiosInstance.get("/progress/dashboard/overview"),
  getActivityStatsByPeriod: async (period: string = "day") =>
    axiosInstance.get("/progress/dashboard/stats", {
      params: {
        period: period,
      },
    }),
};
