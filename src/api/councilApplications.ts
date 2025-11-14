import { API_URLS, apiClient } from "./config";

export type DocumentScreeningApplicant = {
  name: string;
  email: string;
  tel: string;
  appliedAt: string;
  evaluationStatus: string;
  recruitmentStatus: string;
};

export type DocumentScreeningResponse = {
  code: number;
  message: string;
  data: DocumentScreeningApplicant[];
};

export const getDocumentScreeningApplications = async (
  recruitmentId: number
): Promise<DocumentScreeningResponse> => {
  const endpoint = API_URLS.RECRUITMENT_DOCUMENT_SCREENING.replace(
    ":recruitmentId",
    String(recruitmentId)
  );

  const { data } = await apiClient.get(endpoint);

  return data as DocumentScreeningResponse;
};
