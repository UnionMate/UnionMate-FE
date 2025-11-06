import { API_URLS, apiClient } from "./config";
import { useQuery } from "@tanstack/react-query";

export type CouncilMember = {
  councilManagerId: number;
  memberName: string;
  memberEmail: string;
  councilRole: "VICE" | "MANAGER";
};

export type GetCouncilMembersResponse = {
  code: number;
  message: string;
  data: CouncilMember[];
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
