import axios from "axios";

export const SERVER_URI = import.meta.env.VITE_SERVER_URI;

export const API_URLS = {
  RECRUITMENT: "/backend/recruitment",
  MANAGER_REGISTER: "/backend/auth/manager/register",
  MANAGER_LOGIN: "/backend/auth/manager/login",
  CREATE_CLUB: "/backend/councils",
} as const;

export const getApiUrl = (endpoint: string): string => {
  return `${SERVER_URI}${endpoint}`;
};

/**
 * 인증 토큰이 포함된 헤더를 반환합니다.
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

/**
 * 인증 토큰이 자동으로 포함되는 axios 인스턴스입니다.
 */
export const apiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (config: any) => {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
