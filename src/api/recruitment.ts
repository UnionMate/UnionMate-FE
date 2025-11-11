import { API_URLS, apiClient } from "./config";

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
  payload: CreateRecruitmentRequest
): Promise<CreateRecruitmentResponse> => {
  const { data } = await apiClient.post(API_URLS.RECRUITMENT, payload);

  return data as CreateRecruitmentResponse;
};

export const getRecruitments = async (): Promise<GetRecruitmentsResponse> => {
  const { data } = await apiClient.get(API_URLS.RECRUITMENT);

  return data as GetRecruitmentsResponse;
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
  const { data } = await apiClient.post(
    API_URLS.RECRUITMENT_ACTIVATION.replace(
      ":recruitmentId",
      String(recruitmentId)
    ),
    payload
  );

  return data as ActivateRecruitmentResponse;
};

export type DeleteRecruitmentResponse = {
  code: number;
  message: string;
  data: Record<string, never>;
};

export const deleteRecruitment = async (
  recruitmentId: number
): Promise<DeleteRecruitmentResponse> => {
  const { data } = await apiClient.delete(
    `${API_URLS.RECRUITMENT}/${recruitmentId}`
  );

  return data as DeleteRecruitmentResponse;
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
  const { data } = await apiClient.get(
    `${API_URLS.RECRUITMENT}/${recruitmentId}`
  );

  return data as RecruitmentDetailResponse;
};

export type UpdateRecruitmentRequest = CreateRecruitmentRequest;
export type UpdateRecruitmentResponse = CreateRecruitmentResponse;

export const updateRecruitment = async (
  recruitmentId: number,
  payload: UpdateRecruitmentRequest
): Promise<UpdateRecruitmentResponse> => {
  const { data } = await apiClient.patch(
    `${API_URLS.RECRUITMENT}/${recruitmentId}`,
    payload
  );

  return data as UpdateRecruitmentResponse;
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
  const { data } = await apiClient.post(
    API_URLS.APPLICATIONS.replace(":recruitmentId", String(recruitmentId)),
    payload
  );

  return data as SubmitApplicationResponse;
};
