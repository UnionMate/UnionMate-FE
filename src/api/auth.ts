import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { API_URLS } from "./config";

export type ManagerRegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type ManagerRegisterResponse = {
  code: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
};

async function registerManager(
  payload: ManagerRegisterRequest
): Promise<ManagerRegisterResponse> {
  const { data } = await axios.post(API_URLS.MANAGER_REGISTER, payload, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    withCredentials: true,
  });

  // accessToken 로컬스토리지 저장
  if (data?.data?.accessToken) {
    localStorage.setItem("accessToken", data.data.accessToken);
  }

  return data as ManagerRegisterResponse;
}

export function useManagerRegister() {
  return useMutation({
    mutationFn: registerManager,
  });
}
