import type {
  ApplicationAdminAnswer,
  ApplicationAdminDetail,
} from "@/api/application";
import type {
  ApplicantDetail,
  ApplicantQuestion,
} from "@/widget/recruitdetail/types";
import type { RecruitmentDetailData } from "@/features/recruitment/api/recruitment";
import { mapEvaluationStatusToApplicantStatus } from "./statusMeta";

const RECRUITMENT_STAGE_LABEL = {
  DOCUMENT_SCREENING: "서류 심사",
  INTERVIEW: "면접",
  FINAL: "최종 전형",
} as const;

type RecruitmentStageKey = keyof typeof RECRUITMENT_STAGE_LABEL;

const STAGE_FLOW: RecruitmentStageKey[] = [
  "DOCUMENT_SCREENING",
  "INTERVIEW",
  "FINAL",
];

const buildStageSteps = (currentStage?: string) => {
  if (!currentStage) {
    return ["지원 단계"];
  }
  const normalizedStage = currentStage as RecruitmentStageKey;
  const stageIndex = STAGE_FLOW.indexOf(normalizedStage);
  if (stageIndex === -1) {
    return ["지원 단계"];
  }
  return STAGE_FLOW.slice(0, stageIndex + 1).map(
    (stage) => RECRUITMENT_STAGE_LABEL[stage]
  );
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

const buildFallbackSelectOptionTitles = (
  answer: ApplicationAdminAnswer
): string[] => {
  if (
    Array.isArray(answer.selectedOptionTitles) &&
    answer.selectedOptionTitles.length > 0
  ) {
    return answer.selectedOptionTitles;
  }

  if (
    Array.isArray(answer.selectedOptionIds) &&
    answer.selectedOptionIds.length > 0
  ) {
    return answer.selectedOptionIds.map((id, index) => {
      if (typeof id === "number" && Number.isFinite(id)) {
        return `선택지 ${id + 1}`;
      }
      return `선택지 ${index + 1}`;
    });
  }

  return [];
};

type NormalizedOption = { id?: number; title: string; isSelected?: boolean };

const findRecruitmentItemForAnswer = (
  answer: ApplicationAdminAnswer,
  recruitmentDetail?: RecruitmentDetailData
) => {
  if (!recruitmentDetail?.items?.length) {
    return undefined;
  }

  const { recruitmentItemId, order } = answer;

  if (typeof recruitmentItemId === "number") {
    const byId = recruitmentDetail.items.find(
      (item) => item.id === recruitmentItemId
    );
    if (byId) {
      return byId;
    }
  }

  return recruitmentDetail.items.find((item) => item.order === order);
};

const normalizeOptionsFromRecruitment = (
  answer: ApplicationAdminAnswer,
  recruitmentDetail?: RecruitmentDetailData
): NormalizedOption[] => {
  const recruitmentItem = findRecruitmentItemForAnswer(
    answer,
    recruitmentDetail
  );
  if (!recruitmentItem?.options?.length) {
    return [];
  }
  return recruitmentItem.options.map((option, index) => ({
    id: typeof option.id === "number" ? option.id : undefined,
    title:
      typeof option.title === "string" && option.title.trim().length > 0
        ? option.title.trim()
        : `선택지 ${index + 1}`,
    isSelected: false,
  }));
};

const normalizeOptionsFromAnswer = (
  answer: ApplicationAdminAnswer
): NormalizedOption[] => {
  if (!answer.selectOptions?.length) {
    return [];
  }

  return answer.selectOptions.map((option, index) => {
    const fallbackId =
      Array.isArray(answer.selectedOptionIds) &&
      typeof answer.selectedOptionIds[index] === "number"
        ? answer.selectedOptionIds[index]
        : undefined;

    const normalizedId =
      typeof option?.optionId === "number" ? option.optionId : fallbackId;
    const normalizedTitle =
      typeof option?.title === "string" && option.title.trim().length > 0
        ? option.title.trim()
        : `선택지 ${index + 1}`;
    const flag =
      typeof option?.isSelected === "boolean"
        ? option.isSelected
        : typeof option?.selected === "boolean"
        ? option.selected
        : typeof option?.checked === "boolean"
        ? option.checked
        : undefined;
    const isSelected = typeof flag === "boolean" ? flag : true;

    return {
      id: normalizedId,
      title: normalizedTitle,
      isSelected,
    };
  });
};

const buildFallbackNormalizedOptions = (
  answer: ApplicationAdminAnswer
): NormalizedOption[] => {
  const fallbackOptions = buildFallbackSelectOptionTitles(answer);

  return fallbackOptions.map((title, index) => ({
    title,
    id:
      Array.isArray(answer.selectedOptionIds) &&
      typeof answer.selectedOptionIds[index] === "number"
        ? answer.selectedOptionIds[index]
        : undefined,
    isSelected: true,
  }));
};

const applySelectionFlagsFromAnswer = (
  options: NormalizedOption[],
  answer: ApplicationAdminAnswer
): NormalizedOption[] => {
  if (!answer.selectOptions?.length) {
    return options;
  }

  const selectedById = new Map<number, boolean>();
  const selectedByTitle = new Map<string, boolean>();

  answer.selectOptions.forEach((selectOption, index) => {
    const normalizedTitle =
      typeof selectOption?.title === "string" &&
      selectOption.title.trim().length > 0
        ? selectOption.title.trim()
        : `선택지 ${index + 1}`;
    const normalizedId =
      typeof selectOption?.optionId === "number"
        ? selectOption.optionId
        : Array.isArray(answer.selectedOptionIds) &&
          typeof answer.selectedOptionIds[index] === "number"
        ? answer.selectedOptionIds[index]
        : undefined;
    const flag =
      typeof selectOption?.isSelected === "boolean"
        ? selectOption.isSelected
        : typeof selectOption?.selected === "boolean"
        ? selectOption.selected
        : typeof selectOption?.checked === "boolean"
        ? selectOption.checked
        : undefined;
    const resolvedFlag = typeof flag === "boolean" ? flag : true;

    if (typeof normalizedId === "number") {
      selectedById.set(normalizedId, resolvedFlag);
    }
    selectedByTitle.set(normalizedTitle, resolvedFlag);
  });

  if (selectedById.size === 0 && selectedByTitle.size === 0) {
    return options;
  }

  return options.map((option) => {
    let isSelected = option.isSelected ?? false;
    if (typeof option.id === "number" && selectedById.has(option.id)) {
      isSelected = selectedById.get(option.id) ?? isSelected;
    } else if (selectedByTitle.has(option.title)) {
      isSelected = selectedByTitle.get(option.title) ?? isSelected;
    }

    return {
      ...option,
      isSelected,
    };
  });
};

const resolveAvailableOptions = (
  answer: ApplicationAdminAnswer,
  recruitmentDetail?: RecruitmentDetailData
): NormalizedOption[] => {
  const recruitmentOptions = normalizeOptionsFromRecruitment(
    answer,
    recruitmentDetail
  );
  if (recruitmentOptions.length > 0) {
    return applySelectionFlagsFromAnswer(recruitmentOptions, answer);
  }

  const answerOptions = normalizeOptionsFromAnswer(answer);
  if (answerOptions.length > 0) {
    return answerOptions;
  }

  return buildFallbackNormalizedOptions(answer);
};

const resolveSelectedTitles = (
  answer: ApplicationAdminAnswer,
  options: NormalizedOption[]
) => {
  if (options.length === 0) {
    return [];
  }

  const optionTitleMap = new Map<number, string>();
  const optionTitleSet = new Set<string>();
  const selectedByFlag: string[] = [];
  options.forEach((option) => {
    optionTitleSet.add(option.title);
    if (typeof option.id === "number" && !optionTitleMap.has(option.id)) {
      optionTitleMap.set(option.id, option.title);
    }
    if (option.isSelected) {
      selectedByFlag.push(option.title);
    }
  });

  if (selectedByFlag.length > 0) {
    return Array.from(new Set(selectedByFlag));
  }

  const selectedFromIds =
    optionTitleMap.size > 0 && Array.isArray(answer.selectedOptionIds)
      ? answer.selectedOptionIds
          .map((id) =>
            typeof id === "number" ? optionTitleMap.get(id) : undefined
          )
          .filter((title): title is string => Boolean(title))
      : [];

  if (selectedFromIds.length > 0) {
    return selectedFromIds;
  }

  const selectedFromTitles =
    Array.isArray(answer.selectedOptionTitles) && optionTitleSet.size > 0
      ? answer.selectedOptionTitles.filter((title) =>
          optionTitleSet.has(title)
        )
      : [];

  if (selectedFromTitles.length > 0) {
    return selectedFromTitles;
  }

  const fallbackTitles = buildFallbackSelectOptionTitles(answer);
  return fallbackTitles.filter((title) => optionTitleSet.has(title));
};

const normalizeSelectAnswer = (
  answer: ApplicationAdminAnswer,
  recruitmentDetail?: RecruitmentDetailData
): ApplicantQuestion => {
  const normalizedOptions = resolveAvailableOptions(answer, recruitmentDetail);

  return {
    id: `select-${answer.order}`,
    type: "checkbox",
    question: answer.title,
    options: normalizedOptions.map((option) => option.title),
    selected: resolveSelectedTitles(answer, normalizedOptions),
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

const normalizeAnswer = (
  answer: ApplicationAdminAnswer,
  recruitmentDetail?: RecruitmentDetailData
): ApplicantQuestion => {
  if (answer.itemType === "SELECT") {
    return normalizeSelectAnswer(answer, recruitmentDetail);
  }
  return normalizeParagraphAnswer(answer);
};

export const mapAdminApplicationDetailToApplicant = (
  detail: ApplicationAdminDetail,
  recruitmentDetail?: RecruitmentDetailData
): ApplicantDetail => {
  const stageSteps = buildStageSteps(detail.stage?.recruitmentStatus);
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
    steps: stageSteps,
    profile: [
      { label: "지원자명", value: applicantName },
      { label: "이메일", value: applicantEmail },
      { label: "전화번호", value: applicantTel },
    ],
    questions: (detail.answers ?? []).map((answer) =>
      normalizeAnswer(answer, recruitmentDetail)
    ),
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
