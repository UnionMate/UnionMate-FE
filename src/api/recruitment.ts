import { API_URLS, getAuthHeaders } from "./config";

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

export type Recruitment = {
  id: number;
  name: string;
  isActive: boolean;
  recruitmentStatus: string;
};

export type GetRecruitmentsResponse = {
  code: number;
  message: string;
  data: Recruitment[];
};

export const createRecruitment = async (
  data: CreateRecruitmentRequest
): Promise<CreateRecruitmentResponse> => {
  const headers = getAuthHeaders();

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

export const getRecruitments = async (): Promise<GetRecruitmentsResponse> => {
  const headers = getAuthHeaders();

  const response = await fetch(API_URLS.RECRUITMENT, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error Response:", errorText);
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  return response.json();
};

export type ActivateRecruitmentRequest = {
  active: boolean;
};

export type ActivateRecruitmentResponse = {
  code: number;
  message: string;
  data: {
    recruitmentId: number;
    active: boolean;
    open: boolean;
    startAt: string;
    endAt: string;
  };
};

export const activateRecruitment = async (
  recruitmentId: number,
  payload: ActivateRecruitmentRequest
): Promise<ActivateRecruitmentResponse> => {
  const headers = getAuthHeaders();

  const response = await fetch(
    API_URLS.RECRUITMENT_ACTIVATION.replace(
      ":recruitmentId",
      String(recruitmentId)
    ),
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error Response:", errorText);
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  return response.json();
};
