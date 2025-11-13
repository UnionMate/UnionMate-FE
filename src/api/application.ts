import { API_URLS, apiClient } from "./config";
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
  const { data } = await apiClient.get(
    API_URLS.APPLICATION_DETAIL.replace(":applicationId", String(applicationId))
  );

  return data as ApplicationDetailResponse;
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
  const { data } = await apiClient.patch(
    API_URLS.APPLICATION_DETAIL.replace(
      ":applicationId",
      String(applicationId)
    ),
    payload
  );

  return data as UpdateApplicationResponse;
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
  const { data } = await apiClient.get(
    API_URLS.APPLICATION_ADMIN_DETAIL.replace(
      ":applicationId",
      String(applicationId)
    )
  );

  return data as ApplicationAdminDetailResponse;
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
  const { data } = await apiClient.patch(
    API_URLS.APPLICATION_INTERVIEW_SCHEDULE.replace(
      ":applicationId",
      String(applicationId)
    ),
    payload
  );

  return data as UpdateInterviewScheduleResponse;
};

export type UpdateDocumentDecisionRequest = {
  decision: "INTERVIEW" | "FAILED";
};

export const updateDocumentDecision = async (
  applicationId: number,
  payload: UpdateDocumentDecisionRequest
): Promise<MessageResponse> => {
  const { data } = await apiClient.patch(
    API_URLS.APPLICATION_DOCUMENT_DECISION.replace(
      ":applicationId",
      String(applicationId)
    ),
    payload
  );

  return data as MessageResponse;
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
  const { data } = await apiClient.get(
    API_URLS.APPLICATION_COMMENTS.replace(
      ":applicationId",
      String(applicationId)
    )
  );

  return data as GetApplicationCommentsResponse;
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
  const { data } = await apiClient.post(
    API_URLS.APPLICATION_COMMENTS.replace(
      ":applicationId",
      String(applicationId)
    ),
    payload
  );

  return data as MessageResponse;
};

export type UpdateApplicationCommentRequest = {
  content: string;
};

export const updateApplicationComment = async (
  applicationId: number,
  commentId: number,
  payload: UpdateApplicationCommentRequest
): Promise<MessageResponse> => {
  const { data } = await apiClient.patch(
    `${API_URLS.APPLICATION_COMMENTS.replace(
      ":applicationId",
      String(applicationId)
    )}/${commentId}`,
    payload
  );

  return data as MessageResponse;
};

export const deleteApplicationComment = async (
  applicationId: number,
  commentId: number
): Promise<MessageResponse> => {
  const { data } = await apiClient.delete(
    `${API_URLS.APPLICATION_COMMENTS.replace(
      ":applicationId",
      String(applicationId)
    )}/${commentId}`
  );

  return data as MessageResponse;
};

export type InterviewDecisionRequest = {
  decision: "PASSED" | "FAILED";
};

export const updateInterviewDecision = async (
  applicationId: number,
  payload: InterviewDecisionRequest
): Promise<MessageResponse> => {
  const { data } = await apiClient.patch(
    API_URLS.APPLICATION_INTERVIEW_DECISION.replace(
      ":applicationId",
      String(applicationId)
    ),
    payload
  );
  return data as MessageResponse;
};

export type ApplicationEvaluation = {
  evaluationId: number;
  councilManagerId: number;
  councilManagerName: string;
  evaluation: string;
  createdAt: string;
  updatedAt?: string;
};

export type GetApplicationEvaluationsResponse = {
  code: number;
  message: string;
  data: ApplicationEvaluation[];
};

export const getApplicationEvaluations = async (
  applicationId: number
): Promise<GetApplicationEvaluationsResponse> => {
  const { data } = await apiClient.get(
    API_URLS.APPLICATION_EVALUATIONS.replace(
      ":applicationId",
      String(applicationId)
    )
  );
  return data as GetApplicationEvaluationsResponse;
};

export const createApplicationEvaluation = async (
  applicationId: number,
  payload: { evaluation: string }
): Promise<MessageResponse> => {
  const { data } = await apiClient.post(
    API_URLS.APPLICATION_EVALUATIONS.replace(
      ":applicationId",
      String(applicationId)
    ),
    payload
  );
  return data as MessageResponse;
};

export const updateApplicationEvaluation = async (
  applicationId: number,
  evaluationId: number,
  payload: { evaluation: string }
): Promise<MessageResponse> => {
  const { data } = await apiClient.patch(
    `${API_URLS.APPLICATION_EVALUATIONS.replace(
      ":applicationId",
      String(applicationId)
    )}/${evaluationId}`,
    payload
  );
  return data as MessageResponse;
};

export const deleteApplicationEvaluation = async (
  applicationId: number,
  evaluationId: number
): Promise<MessageResponse> => {
  const { data } = await apiClient.delete(
    `${API_URLS.APPLICATION_EVALUATIONS.replace(
      ":applicationId",
      String(applicationId)
    )}/${evaluationId}`
  );
  return data as MessageResponse;
};
