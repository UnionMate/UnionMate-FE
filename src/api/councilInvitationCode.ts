import { API_URLS, apiClient } from "./config";

export type CouncilInvitationCodeData = {
  councilId: number;
  invitationCode: string;
};

export type CouncilInvitationCodeResponse = {
  code: number;
  message: string;
  data: CouncilInvitationCodeData;
};

export const getCouncilInvitationCode = async (
  councilId: number
): Promise<CouncilInvitationCodeResponse> => {
  const endpoint = API_URLS.COUNCIL_INVITATION_CODE.replace(
    ":councilId",
    String(councilId)
  );
  const { data } = await apiClient.get(endpoint);
  return data as CouncilInvitationCodeResponse;
};

export type UpdateCouncilInvitationCodeRequest = {
  invitationCode: string;
};

export const refreshCouncilInvitationCode = async (
  councilId: number,
  payload: UpdateCouncilInvitationCodeRequest
): Promise<CouncilInvitationCodeResponse> => {
  const endpoint = API_URLS.COUNCIL_INVITATION_CODE.replace(
    ":councilId",
    String(councilId)
  );
  const { data } = await apiClient.patch(endpoint, payload);
  return data as CouncilInvitationCodeResponse;
};
