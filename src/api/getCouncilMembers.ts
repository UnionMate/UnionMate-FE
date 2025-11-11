import { API_URLS, apiClient } from "./config";
import { useQuery } from "@tanstack/react-query";

export type CouncilMember = {
  councilManagerId: number;
  memberName: string;
  memberEmail: string;
  councilRole: "VICE" | "MEMBER";
};

export type GetCouncilMembersResponse = {
  code: number;
  message: string;
  data: CouncilMember[];
};

export type MessageResponse = {
  code: number;
  message: string;
  data?: unknown;
};

async function getCouncilMembers(
  councilId: number | string
): Promise<GetCouncilMembersResponse> {
  const { data } = await apiClient.get(
    API_URLS.GET_COUNCIL_MEMBERS.replace(":councilId", String(councilId))
  );
  return data as GetCouncilMembersResponse;
}

export function useGetCouncilMembers(councilId: number | string | undefined) {
  return useQuery({
    queryKey: ["councilMembers", councilId],
    queryFn: () => getCouncilMembers(councilId!),
    enabled: !!councilId,
  });
}

export const delegateCouncilPresident = async (
  newPresidentId: number
): Promise<MessageResponse> => {
  const { data } = await apiClient.patch(API_URLS.COUNCIL_PRESIDENT_DELEGATION, {
    newPresidentId,
  });
  return data as MessageResponse;
};

export const removeCouncilMember = async (
  councilManagerId: number
): Promise<MessageResponse> => {
  const { data } = await apiClient.delete(
    API_URLS.COUNCIL_MEMBER_REMOVE.replace(
      ":councilManagerId",
      String(councilManagerId)
    )
  );
  return data as MessageResponse;
};
