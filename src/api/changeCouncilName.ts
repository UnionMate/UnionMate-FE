import { API_URLS, apiClient } from "./config";
import { useMutation } from "@tanstack/react-query";

export type ChangeCouncilNameRequest = {
  name: string;
};

export type ChangeCouncilNameResponse = {
  code: number;
  message: string;
  data: {
    councilId: number;
    councilName: string;
  };
};

async function changeCouncilName(
  councilId: number | string,
  payload: ChangeCouncilNameRequest
): Promise<ChangeCouncilNameResponse> {
  const { data } = await apiClient.patch(
    API_URLS.CHANGE_COUNCIL_NAME.replace(":councilId", String(councilId)),
    payload
  );
  return data as ChangeCouncilNameResponse;
}

export function useChangeCouncilName(councilId: number | string) {
  return useMutation({
    mutationFn: (payload: ChangeCouncilNameRequest) =>
      changeCouncilName(councilId, payload),
  });
}
