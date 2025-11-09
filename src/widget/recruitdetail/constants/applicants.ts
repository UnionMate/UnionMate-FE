import type { ApplicantStatus } from "../types";

export const REVIEWER_DISPLAY_NAME = "나 (담당자)";

export const APPLICANT_STATUS_OPTIONS: ApplicantStatus[] = [
  "pass",
  "fail",
  "pending",
];

export const statusLabelMap: Record<ApplicantStatus, string> = {
  pass: "합격",
  fail: "불합격",
  pending: "평가 대기",
};

export const statusToneMap: Record<ApplicantStatus, string> = {
  pass: "bg-primary/10 text-primary",
  fail: "bg-red-100 text-red-600",
  pending: "bg-yellow-100 text-yellow-700",
};

export const statusBadgeMap: Record<ApplicantStatus, string> = {
  pass: "bg-primary/10 text-primary",
  fail: "bg-red-100 text-red-600",
  pending: "bg-yellow-100 text-yellow-700",
};

export const makeMemoId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
