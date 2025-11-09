import {
  API_URLS,
  getAuthHeaders,
  handleFetchResponse,
} from "./config";

export type DocumentScreeningApplicant = {
  name: string;
  email: string;
  tel: string;
  appliedAt: string;
  evaluationStatus: string;
};

export type DocumentScreeningResponse = {
  code: number;
  message: string;
  data: DocumentScreeningApplicant[];
};

export const getDocumentScreeningApplications = async (
  councilId: number
): Promise<DocumentScreeningResponse> => {
  const headers = getAuthHeaders();

  const endpoint = API_URLS.COUNCIL_DOCUMENT_SCREENING.replace(
    ":councilId",
    String(councilId)
  );

  const response = await fetch(endpoint, {
    method: "GET",
    headers,
  });

  return handleFetchResponse<DocumentScreeningResponse>(response);
};
