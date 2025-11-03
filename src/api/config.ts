export const SERVER_URI = import.meta.env.VITE_SERVER_URI;

// Vercel 프록시 및 Vite 프록시를 타기 위해 상대 경로로 고정
export const API_URLS = {
  RECRUITMENT: "/backend/recruitment",
  MANAGER_REGISTER: "/backend/auth/manager/register",
} as const;
