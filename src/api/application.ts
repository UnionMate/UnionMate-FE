import {
  API_URLS,
  getAuthHeaders,
  handleFetchResponse,
} from "./config";
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

