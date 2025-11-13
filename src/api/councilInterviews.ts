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
  councilId: number
): Promise<GetInterviewApplicantsResponse> => {
  const endpoint = API_URLS.COUNCIL_INTERVIEW_APPLICATIONS.replace(
    ":councilId",
    String(councilId)
  );
  const { data } = await apiClient.get(endpoint);
  return data as GetInterviewApplicantsResponse;
};
