import axios from "axios";
import axiosInstance from "./http";

export const authService = {
  login: async (username: string, password: string) =>
    axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/admin/login`, {
      username,
      password,
    }),
  test: async () => axiosInstance.get("/vocabulary/test"),
};
