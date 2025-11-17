import axios from "axios";

// VITE_SERVER_URI가 설정되어 있으면 사용하고, 없으면 빈 문자열(상대 경로) 사용
// Vercel rewrites를 통해 /backend 경로가 프록시되므로 상대 경로 사용
const rawServerUri = import.meta.env.VITE_SERVER_URI || "";

export const SERVER_URI = rawServerUri ? rawServerUri.replace(/\/$/, "") : "";

export const API_URLS = {
  RECRUITMENT: "/backend/recruitment",
  RECRUITMENT_ACTIVATION: "/backend/recruitment/:recruitmentId/activation",
  RECRUITMENT_FINAL_RESULT: "/backend/recruitment/:recruitmentId/results",
  RECRUITMENT_SEND_MAIL: "/backend/recruitment/:recruitmentId/send/mail",
  MANAGER_REGISTER: "/backend/auth/manager/register",
  MANAGER_LOGIN: "/backend/auth/manager/login",
  MANAGER_EMAIL_VERIFY: "/backend/auth/manager/email",
  CREATE_CLUB: "/backend/councils",
  CHANGE_COUNCIL_NAME: "/backend/councils/:councilId/names",
  GET_COUNCIL_MEMBERS: "/backend/councils/:councilId/members",
  APPLICATIONS: "/backend/applications/:recruitmentId",
  APPLICATION_DETAIL: "/backend/applications/:applicationId",
  APPLICATION_ADMIN_DETAIL: "/backend/applications/:applicationId/detail/admin",
  APPLICATION_COMMENTS: "/backend/applications/:applicationId/comments",
  APPLICATION_INTERVIEW_SCHEDULE:
    "/backend/applications/:applicationId/interview/schedule",
  APPLICATION_DOCUMENT_DECISION:
    "/backend/applications/:applicationId/document/decision",
  APPLICATION_INTERVIEW_DECISION:
    "/backend/applications/:applicationId/interview/evaluation",
  APPLICATION_EVALUATIONS: "/backend/applications/:applicationId/evaluations",
  COUNCIL_INVITATION_CODE: "/backend/councils/:councilId/invitation-codes",
  COUNCIL_INVITATION_JOIN: "/backend/councils/invitation/:invitationCode",
  COUNCIL_PRESIDENT_DELEGATION: "/backend/councils/vice",
  COUNCIL_MEMBER_REMOVE: "/backend/councils/members/:councilManagerId",
  RECRUITMENT_INTERVIEW_APPLICATIONS:
    "/backend/councils/:recruitmentId/applications/interview",
  MY_APPLICATIONS: "/backend/applications/mine",
  RECRUITMENT_DOCUMENT_SCREENING:
    "/backend/councils/:recruitmentId/applications/document-screening",
} as const;

export const getApiUrl = (endpoint: string): string => {
  if (!SERVER_URI) {
    return endpoint;
  }
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  return `${SERVER_URI}${normalizedEndpoint}`;
};

const TOKEN_EXPIRED_CODE = 10002;
const TOKEN_EXPIRED_MESSAGE = "만료된 토큰입니다";

let hasRedirectedForTokenExpiration = false;

const clearAuthTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("token");
};

export const handleTokenExpiration = () => {
  if (hasRedirectedForTokenExpiration) {
    return;
  }
  hasRedirectedForTokenExpiration = true;
  clearAuthTokens();
  if (typeof window !== "undefined" && window.location) {
    if (typeof window.history?.replaceState === "function") {
      window.history.replaceState(null, "", window.location.href);
    }
    window.location.replace("/admin/login");
  }
};

type TokenErrorPayload = {
  code?: number;
  message?: string;
};

const isTokenErrorPayload = (value: unknown): value is TokenErrorPayload => {
  return typeof value === "object" && value !== null;
};

export const checkTokenExpiration = (payload: unknown) => {
  if (!isTokenErrorPayload(payload)) {
    return;
  }
  const { code, message } = payload;
  if (
    code === TOKEN_EXPIRED_CODE ||
    (typeof message === "string" && message.includes(TOKEN_EXPIRED_MESSAGE))
  ) {
    handleTokenExpiration();
  }
};

export async function handleFetchResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let parsed: unknown = text;

  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      // JSON 이 아닌 응답은 그대로 사용합니다.
    }
  } else {
    parsed = {};
  }

  checkTokenExpiration(parsed);

  if (!response.ok) {
    const errorMessage =
      typeof parsed === "object" && parsed !== null && "message" in parsed
        ? String((parsed as { message?: string }).message ?? "")
        : text || response.statusText;

    const logPayload =
      typeof parsed === "string" ? parsed : JSON.stringify(parsed);
    console.error("API Error Response:", logPayload);

    throw new Error(
      `HTTP error! status: ${response.status} - ${errorMessage || logPayload}`
    );
  }

  return parsed as T;
}

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
  baseURL: SERVER_URI || undefined,
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

apiClient.interceptors.response.use(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (response: any) => {
    checkTokenExpiration(response?.data);
    return response;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (error: any) => {
    if (error?.response?.data) {
      checkTokenExpiration(error.response.data);
    }
    return Promise.reject(error);
  }
);
