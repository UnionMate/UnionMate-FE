import type {
  QuestionConfig,
  QuestionOption,
  QuestionType,
} from "@/widget/formEdit/types";
import type {
  CreateRecruitmentRequest,
  CreateRecruitmentItemRequest,
  RecruitmentDetailData,
  RecruitmentDetailItem,
} from "./recruitment";
import { FIXED_FIELDS } from "@/widget/formEdit/constants";

/**
 * 폼 에디터의 질문 타입을 API의 RecruitmentItemType으로 변환
 */
const convertQuestionTypeToApiType = (
  questionType: QuestionConfig["type"]
): CreateRecruitmentItemRequest["type"] => {
  switch (questionType) {
    case "single-check":
    case "multi-check":
      return "SELECT";
    case "short-answer":
    case "long-answer":
      return "TEXT";
    case "date-picker":
      return "CALENDAR";
    case "description":
      return "ANNOUNCEMENT";
    default:
      return "TEXT";
  }
};

/**
 * 폼 에디터의 질문을 API 형식으로 변환
 */
const convertQuestionToApiItem = (
  question: QuestionConfig,
  order: number
): CreateRecruitmentItemRequest => {
  const baseItem: CreateRecruitmentItemRequest = {
    type: convertQuestionTypeToApiType(question.type),
    required: question.isRequired,
    title: question.title,
    order,
    description: question.description,
    multiple: question.multiple ?? false,
    options: [],
    maxLength: undefined,
    date: undefined,
    announcement: undefined,
  };

  // SELECT 타입인 경우 (단일/복수 체크)
  if (question.type === "single-check" || question.type === "multi-check") {
    baseItem.multiple = question.multiple ?? question.type === "multi-check";
    baseItem.options =
      question.options?.map((option, index) => ({
        title: option.text,
        order: index + 1,
        isEtc: option.isOther || false,
        etcTitle: option.isOther ? option.placeholder : undefined,
      })) || [];
  }

  // TEXT 타입인 경우 (단문형/장문형)
  if (question.type === "short-answer" || question.type === "long-answer") {
    baseItem.multiple = question.multiple ?? question.type === "long-answer";
    baseItem.maxLength =
      question.maxLength ?? (question.type === "short-answer" ? 100 : 1000);
  }

  // CALENDAR 타입인 경우 (날짜 선택)
  if (question.type === "date-picker" && question.dateValue) {
    baseItem.date = question.dateValue;
  }

  // ANNOUNCEMENT 타입인 경우 (설명 추가)
  if (question.type === "description") {
    baseItem.announcement = question.description;
  }

  return baseItem;
};

/**
 * 폼 에디터 데이터를 API 요청 형식으로 변환
 */
export const convertFormDataToApiRequest = (
  name: string,
  endDate: Date | null,
  endTime: string,
  questions: QuestionConfig[]
): CreateRecruitmentRequest => {
  // 종료일과 종료시간을 합쳐서 ISO 문자열로 변환
  let endAt: string | undefined;
  if (endDate) {
    const [hours = "0", minutes = "0"] = endTime.split(":");
    const endDateTime = new Date(endDate);
    endDateTime.setHours(Number(hours), Number(minutes), 0, 0);
    endAt = endDateTime.toISOString();
  }

  // 질문들을 API 형식으로 변환
  const items: CreateRecruitmentItemRequest[] = questions.map(
    (question, index) => convertQuestionToApiItem(question, index + 1)
  );

  return {
    name,
    endAt,
    isActive: false,
    recruitmentStatus: "DOCUMENT_SCREENING",
    items,
  };
};

const createQuestionId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const mapRecruitmentTypeToQuestionType = (
  item: RecruitmentDetailItem
): QuestionType => {
  switch (item.type) {
    case "SELECT":
      return item.multiple ? "multi-check" : "single-check";
    case "TEXT":
      return item.maxLength && item.maxLength > 255
        ? "long-answer"
        : "short-answer";
    case "CALENDAR":
      return "date-picker";
    case "ANNOUNCEMENT":
      return "description";
    default:
      return "short-answer";
  }
};

const convertOptions = (
  options: RecruitmentDetailItem["options"]
): QuestionOption[] => {
  if (!options || options.length === 0) {
    return [
      {
        id: createQuestionId(),
        text: "",
        helper: true,
        placeholder: "선택지를 입력하세요.",
      },
      {
        id: createQuestionId(),
        text: "",
        helper: true,
        placeholder: "선택지를 입력하세요.",
      },
    ];
  }

  return options
    .sort((a, b) => a.order - b.order)
    .map((option) => ({
      id: createQuestionId(),
      text: option.title ?? "",
      helper: true,
      placeholder: option.etcTitle ?? option.title ?? "",
      isOther: option.isEtc ?? false,
    }));
};

const convertRecruitmentItemToQuestion = (
  item: RecruitmentDetailItem
): QuestionConfig | null => {
  const questionType = mapRecruitmentTypeToQuestionType(item);
  const normalizedDescription =
    item.type === "ANNOUNCEMENT"
      ? item.announcement ?? item.description ?? ""
      : item.description ?? "";

  const baseQuestion: QuestionConfig = {
    id: createQuestionId(),
    type: questionType,
    title: item.title ?? "",
    description: normalizedDescription,
    isRequired: Boolean(item.required),
  };

  if (questionType === "single-check" || questionType === "multi-check") {
    return {
      ...baseQuestion,
      multiple: questionType === "multi-check",
      options: convertOptions(item.options),
    };
  }

  if (questionType === "short-answer" || questionType === "long-answer") {
    return {
      ...baseQuestion,
      multiple: questionType === "long-answer",
      maxLength:
        item.maxLength ?? (questionType === "short-answer" ? 255 : 1000),
    };
  }

  if (questionType === "date-picker") {
    return {
      ...baseQuestion,
      dateValue: item.date ?? "",
    };
  }

  if (questionType === "description") {
    return {
      ...baseQuestion,
      isRequired: false,
    };
  }

  return baseQuestion;
};

const formatEndTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const convertRecruitmentDetailToFormData = (
  detail: RecruitmentDetailData
) => {
  const rawEndDate = detail.endAt ? new Date(detail.endAt) : null;
  const isValidDate =
    rawEndDate !== null && !Number.isNaN(rawEndDate.getTime());
  const endDate = isValidDate ? rawEndDate : null;
  const endTime = isValidDate && endDate ? formatEndTime(endDate) : "00:00";

  const fixedLabels = new Set(FIXED_FIELDS.map((field) => field.label));
  const dynamicItems = detail.items
    ?.filter(
      (item) => !fixedLabels.has(item.title as "이름" | "전화번호" | "이메일")
    )
    .sort((a, b) => a.order - b.order);

  const questions =
    dynamicItems
      ?.map((item) => convertRecruitmentItemToQuestion(item))
      .filter((question): question is QuestionConfig => Boolean(question)) ??
    [];

  return {
    name: detail.name ?? "",
    endDate,
    endTime,
    questions,
  };
};
