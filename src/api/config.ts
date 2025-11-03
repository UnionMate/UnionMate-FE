export const SERVER_URI = import.meta.env.VITE_SERVER_URI;

export const API_URLS = {
  RECRUITMENT: `${SERVER_URI}/backend/recruitment`,
  MANAGER_REGISTER: `${SERVER_URI}/backend/auth/manager/register`,
} as const;
