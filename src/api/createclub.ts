import { API_URLS, apiClient } from "./config";
import { useMutation } from "@tanstack/react-query";

export type CreateClubRequest = {
  name: string;
};

export type CreateClubResponse = {
  code: number;
  message: string;
  data: {
    councilId: number;
    councilName: string;
  };
};

async function createClub(
  payload: CreateClubRequest
): Promise<CreateClubResponse> {
  // apiClient는 자동으로 토큰을 헤더에 추가합니다
  const { data } = await apiClient.post(API_URLS.CREATE_CLUB, payload);
  return data as CreateClubResponse;
}

export function useCreateClub() {
  return useMutation({
    mutationFn: createClub,
  });
}
