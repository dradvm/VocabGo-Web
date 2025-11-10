// utils/axiosInstance.ts
import axios from "axios";

let accessToken: string | null = null;

export const TokenManager = {
  getAccess: () =>
    accessToken ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("accessToken")
      : null),

  setAccess: (token: string) => {
    accessToken = token;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("accessToken", token);
    }
  },

  clearAccess: () => {
    accessToken = null;
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("accessToken");
    }
  },
};

export const createAxios = (
  route = "",
  contentType = "application/json",
  timeout = 30000,
  isInterceptor = true
) => {
  const instance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}${route}`,
    timeout,
    headers: {
      "Content-Type": contentType,
    },
  });

  if (isInterceptor) {
    instance.interceptors.request.use(
      (config) => {
        const token = TokenManager.getAccess();
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (err) => Promise.reject(err)
    );

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Web: server sẽ đọc refreshToken từ HTTP-only cookie, không cần body
            const res = await axios.post(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh-token`,
              {},
              { withCredentials: true }
            );

            const newAccess = res.data.accessToken;

            if (newAccess) TokenManager.setAccess(newAccess);

            originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
            return instance(originalRequest);
          } catch (refreshErr) {
            TokenManager.clearAccess();
            console.log(refreshErr);
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            return Promise.reject(refreshErr);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  return instance;
};

const axiosInstance = createAxios();

export default axiosInstance;
