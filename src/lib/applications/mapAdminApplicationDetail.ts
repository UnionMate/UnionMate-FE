import type {
  ApplicationAdminAnswer,
  ApplicationAdminDetail,
} from "@/api/application";
import type {
  ApplicantDetail,
  ApplicantQuestion,
} from "@/widget/recruitdetail/types";
import { mapEvaluationStatusToApplicantStatus } from "./statusMeta";

const RECRUITMENT_STAGE_LABEL: Record<string, string> = {
  DOCUMENT_SCREENING: "서류 심사",
  INTERVIEW: "면접",
  FINAL: "최종 전형",
};

const formatDisplayDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
};

const formatDisplayTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHour = hours % 12 || 12;
  return `${suffix} ${String(normalizedHour).padStart(2, "0")}:${minutes}`;
};

const normalizeSelectAnswer = (answer: ApplicationAdminAnswer) => {
  const options =
    answer.selectedOptionTitles ??
    answer.selectedOptionIds?.map((id) => `선택지 ${id + 1}`) ??
    [];

  return {
    id: `select-${answer.order}`,
    type: "checkbox",
    question: answer.title,
    options,
    selected: [...options],
  } as const;
};

const normalizeParagraphAnswer = (
  answer: ApplicationAdminAnswer
): ApplicantQuestion => {
  const text =
    answer.answer ??
    answer.date ??
    (Array.isArray(answer.selectedOptionTitles)
      ? answer.selectedOptionTitles.join(", ")
      : "") ??
    "";

  return {
    id: `paragraph-${answer.order}`,
    type: "paragraph",
    question: answer.title,
    answer: text,
  };
};

const normalizeAnswer = (
  answer: ApplicationAdminAnswer
): ApplicantQuestion => {
  if (answer.itemType === "SELECT") {
    return normalizeSelectAnswer(answer);
  }
  return normalizeParagraphAnswer(answer);
};

export const mapAdminApplicationDetailToApplicant = (
  detail: ApplicationAdminDetail
): ApplicantDetail => {
  const stageLabel =
    RECRUITMENT_STAGE_LABEL[detail.stage?.recruitmentStatus] ?? "지원 단계";
  const interviewTimeIso = detail.interview?.time;

  return {
    id: String(detail.applicationId),
    name: detail.applicant.name,
    status: mapEvaluationStatusToApplicantStatus(
      detail.stage?.evaluationStatus
    ),
    appliedTrack: detail.recruitment.recruitmentName,
    submittedAt: detail.submittedAt,
    steps: [stageLabel],
    profile: [
      { label: "지원자명", value: detail.applicant.name },
      { label: "이메일", value: detail.applicant.email },
      { label: "전화번호", value: detail.applicant.tel },
    ],
    questions: (detail.answers ?? []).map(normalizeAnswer),
    memos: [],
    interview: {
      date: formatDisplayDate(interviewTimeIso),
      time: formatDisplayTime(interviewTimeIso),
      location: detail.interview?.place ?? "",
      rawTime: interviewTimeIso,
    },
    reactions: {
      cheer: 0,
      impressed: 0,
      curious: 0,
    },
  };
};
