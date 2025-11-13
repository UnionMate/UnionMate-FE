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

const normalizeSelectAnswer = (
  answer: ApplicationAdminAnswer
): ApplicantQuestion => {
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
  };
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

const normalizeAnswer = (answer: ApplicationAdminAnswer): ApplicantQuestion => {
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
  const applicantName = detail.applicant?.name ?? "이름 미확인";
  const applicantEmail = detail.applicant?.email ?? "-";
  const applicantTel = detail.applicant?.tel ?? "-";
  const recruitmentName = detail.recruitment?.recruitmentName ?? "미지정 전형";

  return {
    id: String(detail.applicationId),
    name: applicantName,
    status: mapEvaluationStatusToApplicantStatus(
      detail.stage?.evaluationStatus,
      detail.stage?.recruitmentStatus
    ),
    appliedTrack: recruitmentName,
    submittedAt: detail.submittedAt ?? "",
    steps: [stageLabel],
    profile: [
      { label: "지원자명", value: applicantName },
      { label: "이메일", value: applicantEmail },
      { label: "전화번호", value: applicantTel },
    ],
    questions: (detail.answers ?? []).map(normalizeAnswer),
    memos: [],
    evaluationStatus: detail.stage?.evaluationStatus,
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
