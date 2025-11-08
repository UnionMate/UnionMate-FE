import { API_URLS, apiClient } from "./config";
import { useMutation } from "@tanstack/react-query";

export type MyApplicationsRequest = {
  name: string;
  email: string;
};

export type MyApplication = {
  applicationId: number;
  recruitmentId: number;
  recruitmentName: string;
  recruitmentStatus: string;
};

export type MyApplicationsResponse = {
  code: number;
  message: string;
  data: MyApplication[];
};

export const fetchMyApplications = async (
  payload: MyApplicationsRequest
): Promise<MyApplicationsResponse> => {
  const { data } = await apiClient.get(API_URLS.MY_APPLICATIONS, {
    params: payload,
  });

  return data as MyApplicationsResponse;
};

export const useMyApplications = () => {
  return useMutation({
    mutationFn: fetchMyApplications,
  });
};
