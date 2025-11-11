import type { ApplicantStatus } from "@/widget/recruitdetail/types";

export type ApplicationStatusKey =
  | "DOCUMENT_SCREENING"
  | "INTERVIEW"
  | "FINAL"
  | (string & {});

type StatusMeta = {
  label: string;
  description: string;
  badgeClass: string;
};

const STATUS_META: Record<ApplicationStatusKey, StatusMeta> = {
  DOCUMENT_SCREENING: {
    label: "서류 심사 중",
    description: "서류 검토 단계이며 지원서 내용을 수정할 수 있습니다.",
    badgeClass: "bg-blue-50 text-blue-600",
  },
  INTERVIEW: {
    label: "면접 진행 중",
    description: "면접 단계가 진행 중이에요. 지원서를 더 이상 수정할 수 없습니다.",
    badgeClass: "bg-amber-50 text-amber-600",
  },
  FINAL: {
    label: "최종 전형",
    description: "최종 전형 단계입니다. 제출했던 내용이 그대로 전달됩니다.",
    badgeClass: "bg-green-50 text-green-600",
  },
};

const DEFAULT_STATUS_META: StatusMeta = {
  label: "진행 상태 확인 중",
  description: "현재 전형 단계를 확인할 수 없어요.",
  badgeClass: "bg-gray-100 text-gray-600",
};

export const getApplicationStatusMeta = (
  status: ApplicationStatusKey
): StatusMeta => {
  return STATUS_META[status] ?? DEFAULT_STATUS_META;
};

export const mapEvaluationStatusToApplicantStatus = (
  status?: string
): ApplicantStatus => {
  switch (status) {
    case "PASSED":
    case "INTERVIEW":
      return "pass";
    case "FAILED":
      return "fail";
    default:
      return "pending";
  }
};
