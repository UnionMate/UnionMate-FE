import { API_URLS, apiClient } from "./config";

export type InterviewApplicant = {
  name: string;
  email: string;
  tel: string;
  appliedAt: string;
  evaluationStatus: string;
  recruitmentStatus?: string;
};

export type GetInterviewApplicantsResponse = {
  code: number;
  message: string;
  data: InterviewApplicant[];
};

export const getInterviewApplicants = async (
  recruitmentId: number
): Promise<GetInterviewApplicantsResponse> => {
  const endpoint = API_URLS.RECRUITMENT_INTERVIEW_APPLICATIONS.replace(
    ":recruitmentId",
    String(recruitmentId)
  );
  const { data } = await apiClient.get(endpoint);
  return data as GetInterviewApplicantsResponse;
};
