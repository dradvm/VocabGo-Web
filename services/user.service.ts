import axiosInstance from "./http";

export const userService = {
  getUserOverview: async () => axiosInstance.get("/user/dashboard/overview"),
  getUserStatsByPeriod: async (period: string = "day") =>
    axiosInstance.get("/user/dashboard/stats", {
      params: {
        period: period,
      },
    }),
};
