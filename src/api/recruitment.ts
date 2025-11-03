import { API_URLS } from "./config";

export type RecruitmentItemType =
  | "TEXT"
  | "SELECT"
  | "CALENDAR"
  | "ANNOUNCEMENT";

export type RecruitmentItemOption = {
  title: string;
  order: number;
  isEtc?: boolean;
  etcTitle?: string;
};

export type CreateRecruitmentItemRequest = {
  type: RecruitmentItemType;
  required: boolean;
  title: string;
  order: number;
  description: string;
  multiple?: boolean;
  options?: RecruitmentItemOption[];
  maxLength?: number;
  date?: string;
  announcement?: string;
};

export interface CreateRecruitmentRequest {
  name: string;
  endAt?: string;
  isActive?: boolean;
  recruitmentStatus?: string;
  items: CreateRecruitmentItemRequest[];
}

export type CreateRecruitmentResponse = Record<string, unknown>;

export const createRecruitment = async (
  data: CreateRecruitmentRequest
): Promise<CreateRecruitmentResponse> => {
  // 로컬 스토리지에서 토큰 가져오기
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // 토큰이 있으면 Authorization 헤더 추가
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(API_URLS.RECRUITMENT, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error Response:", errorText);
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  return response.json();
};
