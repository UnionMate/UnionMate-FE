import type { QuestionConfig } from "@/widget/formEdit/types";
import type {
  CreateRecruitmentRequest,
  CreateRecruitmentItemRequest,
} from "./recruitment";

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
  formName: string,
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
    name: formName,
    endAt,
    isActive: false,
    recruitmentStatus: "DOCUMENT_SCREENING",
    items,
  };
};
