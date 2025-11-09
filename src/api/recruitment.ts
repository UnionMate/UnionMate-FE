import {
  API_URLS,
  getApiUrl,
  getAuthHeaders,
  handleFetchResponse,
} from "./config";

export type RecruitmentItemType =
  | "TEXT"
  | "SELECT"
  | "CALENDAR"
  | "ANNOUNCEMENT";

export type RecruitmentItemOption = {
  id?: number;
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

  const response = await fetch(getApiUrl(API_URLS.RECRUITMENT), {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  return handleFetchResponse<CreateRecruitmentResponse>(response);
};

export const getRecruitments = async (): Promise<GetRecruitmentsResponse> => {
  const headers = getAuthHeaders();

  const response = await fetch(getApiUrl(API_URLS.RECRUITMENT), {
    method: "GET",
    headers,
  });

  return handleFetchResponse<GetRecruitmentsResponse>(response);
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
    getApiUrl(
      API_URLS.RECRUITMENT_ACTIVATION.replace(
        ":recruitmentId",
        String(recruitmentId)
      )
    ),
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    }
  );

  return handleFetchResponse<ActivateRecruitmentResponse>(response);
};

export type DeleteRecruitmentResponse = {
  code: number;
  message: string;
  data: Record<string, never>;
};

export const deleteRecruitment = async (
  recruitmentId: number
): Promise<DeleteRecruitmentResponse> => {
  const headers = getAuthHeaders();

  const response = await fetch(
    getApiUrl(`${API_URLS.RECRUITMENT}/${recruitmentId}`),
    {
      method: "DELETE",
      headers,
    }
  );

  return handleFetchResponse<DeleteRecruitmentResponse>(response);
};

export type RecruitmentDetailItem = {
  id: number;
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

export type RecruitmentDetailData = {
  id: number;
  name: string;
  endAt?: string;
  isActive: boolean;
  recruitmentStatus: string;
  items: RecruitmentDetailItem[];
};

export type RecruitmentDetailResponse = {
  code: number;
  message: string;
  data: RecruitmentDetailData;
};

export const getRecruitmentDetail = async (
  recruitmentId: number
): Promise<RecruitmentDetailResponse> => {
  const headers = getAuthHeaders();

  const response = await fetch(
    getApiUrl(`${API_URLS.RECRUITMENT}/${recruitmentId}`),
    {
      method: "GET",
      headers,
    }
  );

  return handleFetchResponse<RecruitmentDetailResponse>(response);
};

export type UpdateRecruitmentRequest = CreateRecruitmentRequest;
export type UpdateRecruitmentResponse = CreateRecruitmentResponse;

export const updateRecruitment = async (
  recruitmentId: number,
  data: UpdateRecruitmentRequest
): Promise<UpdateRecruitmentResponse> => {
  const headers = getAuthHeaders();

  const response = await fetch(
    getApiUrl(`${API_URLS.RECRUITMENT}/${recruitmentId}`),
    {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    }
  );

  return handleFetchResponse<UpdateRecruitmentResponse>(response);
};

export type ApplicationAnswerPayload = {
  itemId: number;
  text?: string;
  optionIds?: number[];
  date?: string;
};

export type SubmitApplicationRequest = {
  name: string;
  email: string;
  tel: string;
  answers: ApplicationAnswerPayload[];
};

export type SubmitApplicationResponse = {
  code: number;
  message: string;
  data: {
    applicationId: number;
  };
};

export const submitApplication = async (
  recruitmentId: number,
  payload: SubmitApplicationRequest
): Promise<SubmitApplicationResponse> => {
  const headers = getAuthHeaders();

  const response = await fetch(
    getApiUrl(
      API_URLS.APPLICATIONS.replace(":recruitmentId", String(recruitmentId))
    ),
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    }
  );

  return handleFetchResponse<SubmitApplicationResponse>(response);
};
