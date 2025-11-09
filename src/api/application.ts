import { API_URLS, getAuthHeaders, handleFetchResponse } from "./config";
import type {
  RecruitmentItemType,
  SubmitApplicationRequest,
} from "./recruitment";

export type ApplicationAnswerDetail = {
  recruitmentItemId?: number;
  itemType: RecruitmentItemType;
  title: string;
  order: number;
  description?: string;
  multiple?: boolean;
  selectedOptionIds?: number[];
  selectedOptionTitles?: string[];
  text?: string;
  answer?: string;
  value?: string;
  date?: string;
};

export type ApplicationDetailData = {
  applicationId: number;
  recruitmentId: number;
  recruitmentName: string;
  name: string;
  email: string;
  tel: string;
  answers: ApplicationAnswerDetail[];
};

export type ApplicationDetailResponse = {
  code: number;
  message: string;
  data: ApplicationDetailData;
};

export const getApplicationDetail = async (
  applicationId: number
): Promise<ApplicationDetailResponse> => {
  const headers = getAuthHeaders();

  const response = await fetch(
    API_URLS.APPLICATION_DETAIL.replace(
      ":applicationId",
      String(applicationId)
    ),
    {
      method: "GET",
      headers,
    }
  );

  return handleFetchResponse<ApplicationDetailResponse>(response);
};

export type UpdateApplicationRequest = SubmitApplicationRequest;

export type UpdateApplicationResponse = {
  code: number;
  message: string;
  data: {
    applicationId: number;
  };
};

export const updateApplication = async (
  applicationId: number,
  payload: UpdateApplicationRequest
): Promise<UpdateApplicationResponse> => {
  const headers = getAuthHeaders();

  const response = await fetch(
    API_URLS.APPLICATION_DETAIL.replace(
      ":applicationId",
      String(applicationId)
    ),
    {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
    }
  );

  return handleFetchResponse<UpdateApplicationResponse>(response);
};

export type ApplicationAdminAnswer = {
  itemType: string;
  title: string;
  order: number;
  description?: string;
  multiple?: boolean;
  selectedOptionIds?: number[];
  selectedOptionTitles?: string[];
  maxLength?: number;
  date?: string;
  answer?: string;
};

export type ApplicationAdminDetail = {
  applicationId: number;
  recruitment: {
    recruitmentId: number;
    recruitmentName: string;
  };
  applicant: {
    name: string;
    email: string;
    tel: string;
  };
  stage: {
    recruitmentStatus: string;
    evaluationStatus: string;
  };
  interview?: {
    time?: string;
    place?: string;
  };
  answers: ApplicationAdminAnswer[];
  submittedAt: string;
};

export type ApplicationAdminDetailResponse = {
  code: number;
  message: string;
  data: ApplicationAdminDetail;
};

export const getApplicationAdminDetail = async (
  applicationId: number
): Promise<ApplicationAdminDetailResponse> => {
  const headers = getAuthHeaders();

  const response = await fetch(
    API_URLS.APPLICATION_ADMIN_DETAIL.replace(
      ":applicationId",
      String(applicationId)
    ),
    {
      method: "GET",
      headers,
    }
  );

  return handleFetchResponse<ApplicationAdminDetailResponse>(response);
};

export type UpdateInterviewScheduleRequest = {
  time?: string;
  place?: string;
};

export type UpdateInterviewScheduleResponse = {
  code: number;
  message: string;
  data: {
    applicationId: number;
    time?: string;
    place?: string;
  };
};

export const updateInterviewSchedule = async (
  applicationId: number,
  payload: UpdateInterviewScheduleRequest
): Promise<UpdateInterviewScheduleResponse> => {
  const headers = getAuthHeaders();

  const response = await fetch(
    API_URLS.APPLICATION_INTERVIEW_SCHEDULE.replace(
      ":applicationId",
      String(applicationId)
    ),
    {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
    }
  );

  return handleFetchResponse<UpdateInterviewScheduleResponse>(response);
};

export type ApplicationComment = {
  commentId: number;
  councilManagerId: number;
  councilManagerName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
};

export type GetApplicationCommentsResponse = {
  code: number;
  message: string;
  data: ApplicationComment[];
};

export const getApplicationComments = async (
  applicationId: number
): Promise<GetApplicationCommentsResponse> => {
  const headers = getAuthHeaders();

  const response = await fetch(
    API_URLS.APPLICATION_COMMENTS.replace(
      ":applicationId",
      String(applicationId)
    ),
    {
      method: "GET",
      headers,
    }
  );

  return handleFetchResponse<GetApplicationCommentsResponse>(response);
};

export type CreateApplicationCommentRequest = {
  content: string;
};

export type MessageResponse = {
  code: number;
  message: string;
  data: string;
};

export const createApplicationComment = async (
  applicationId: number,
  payload: CreateApplicationCommentRequest
): Promise<MessageResponse> => {
  const headers = getAuthHeaders();

  const response = await fetch(
    API_URLS.APPLICATION_COMMENTS.replace(
      ":applicationId",
      String(applicationId)
    ),
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    }
  );

  return handleFetchResponse<MessageResponse>(response);
};

export type UpdateApplicationCommentRequest = {
  content: string;
};

export const updateApplicationComment = async (
  applicationId: number,
  commentId: number,
  payload: UpdateApplicationCommentRequest
): Promise<MessageResponse> => {
  const headers = getAuthHeaders();

  const response = await fetch(
    `${API_URLS.APPLICATION_COMMENTS.replace(
      ":applicationId",
      String(applicationId)
    )}/${commentId}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
    }
  );

  return handleFetchResponse<MessageResponse>(response);
};

export const deleteApplicationComment = async (
  applicationId: number,
  commentId: number
): Promise<MessageResponse> => {
  const headers = getAuthHeaders();

  const response = await fetch(
    `${API_URLS.APPLICATION_COMMENTS.replace(
      ":applicationId",
      String(applicationId)
    )}/${commentId}`,
    {
      method: "DELETE",
      headers,
    }
  );

  return handleFetchResponse<MessageResponse>(response);
};
