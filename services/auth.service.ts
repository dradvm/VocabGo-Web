import axios from "axios";
import axiosInstance from "./http";

export const authService = {
  login: async (username: string, password: string) =>
    axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/admin/login`, {
      username,
      password,
    }),
  getUsers: async (page = 1, limit = 10, search = "") =>
    axiosInstance.get("/auth/users", { params: { page, limit, search } }),
  toggleBan: async (userId: string) =>
    axiosInstance.patch(`/auth/toggleStatus/${userId}`),
};
