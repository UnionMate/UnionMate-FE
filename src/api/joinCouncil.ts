import { API_URLS, apiClient } from "./config";

export type JoinCouncilResponse = {
  code: number;
  message: string;
  data: {
    councilId: number;
    councilName: string;
  };
};

export const joinCouncilByInvitation = async (
  invitationCode: string
): Promise<JoinCouncilResponse> => {
  const endpoint = API_URLS.COUNCIL_INVITATION_JOIN.replace(
    ":invitationCode",
    encodeURIComponent(invitationCode)
  );
  const { data } = await apiClient.post(endpoint);
  return data as JoinCouncilResponse;
};
