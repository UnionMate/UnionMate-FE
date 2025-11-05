export const SERVER_URI = import.meta.env.VITE_SERVER_URI;

export const API_URLS = {
  RECRUITMENT: "/backend/recruitment",
  MANAGER_REGISTER: "/backend/auth/manager/register",
  MANAGER_LOGIN: "/backend/auth/manager/login",
} as const;

export const getApiUrl = (endpoint: string): string => {
  return `${SERVER_URI}${endpoint}`;
};
