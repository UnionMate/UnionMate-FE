import { useMutation } from "@tanstack/react-query";
import { API_URLS, apiClient } from "./config";

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

export type ManagerLoginRequest = {
  email: string;
  password: string;
};

export type ManagerLoginResponse = {
  code: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    councilId: number;
  };
};

async function registerManager(
  payload: ManagerRegisterRequest
): Promise<ManagerRegisterResponse> {
  const { data } = await apiClient.post(API_URLS.MANAGER_REGISTER, payload, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true,
  });

  // accessToken 로컬스토리지 저장
  if (data?.data?.accessToken) {
    localStorage.setItem("accessToken", data.data.accessToken);
  }

  return data as ManagerRegisterResponse;
}

async function loginManager(
  payload: ManagerLoginRequest
): Promise<ManagerLoginResponse> {
  const { data } = await apiClient.post(API_URLS.MANAGER_LOGIN, payload, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true,
  });

  // accessToken 로컬스토리지 저장
  if (data?.data?.accessToken) {
    localStorage.setItem("accessToken", data.data.accessToken);
  }

  return data as ManagerLoginResponse;
}

export function useManagerRegister() {
  return useMutation({
    mutationFn: registerManager,
  });
}

export function useManagerLogin() {
  return useMutation({
    mutationFn: loginManager,
  });
}

export type VerifyManagerEmailRequest = {
  email: string;
  univName: string;
};

export type VerifyManagerEmailResponse = {
  code: number;
  message: string;
  data: {
    isAuthorize: boolean;
  };
};

async function verifyManagerEmail(
  payload: VerifyManagerEmailRequest
): Promise<VerifyManagerEmailResponse> {
  const { data } = await apiClient.post(API_URLS.MANAGER_EMAIL_VERIFY, payload);
  return data as VerifyManagerEmailResponse;
}

export function useVerifyManagerEmail() {
  return useMutation({
    mutationFn: verifyManagerEmail,
  });
}
