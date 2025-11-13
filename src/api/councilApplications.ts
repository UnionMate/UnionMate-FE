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
  councilId: number
): Promise<DocumentScreeningResponse> => {
  const endpoint = API_URLS.COUNCIL_DOCUMENT_SCREENING.replace(
    ":councilId",
    String(councilId)
  );

  const { data } = await apiClient.get(endpoint);

  return data as DocumentScreeningResponse;
};
