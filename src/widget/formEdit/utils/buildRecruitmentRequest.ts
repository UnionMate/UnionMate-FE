import type {
  CreateRecruitmentItemRequest,
  CreateRecruitmentRequest,
  RecruitmentItemOption,
} from "@/api/recruitment";
import { FIXED_FIELDS } from "../constants";
import type { QuestionConfig } from "../types";

type BuildRecruitmentRequestParams = {
  formName: string;
  startDate: Date | null;
  startTime: string;
  endDate: Date | null;
  endTime: string;
  questions: QuestionConfig[];
};

const mergeDateAndTime = (date: Date | null, time: string) => {
  if (!date) return undefined;
  const [hours = "0", minutes = "0"] = time.split(":");
  const parsedHours = Number.parseInt(hours, 10);
  const parsedMinutes = Number.parseInt(minutes, 10);
  const merged = new Date(date);
  merged.setHours(
    Number.isNaN(parsedHours) ? 0 : parsedHours,
    Number.isNaN(parsedMinutes) ? 0 : parsedMinutes,
    0,
    0
  );
  return merged.toISOString();
};

const buildOption = (
  option: NonNullable<QuestionConfig["options"]>[number],
  index: number
): RecruitmentItemOption => {
  const trimmedTitle = option.text?.trim() ?? "";
  const fallbackTitle = option.placeholder?.trim() ?? `선택지 ${index + 1}`;

  return {
    title: trimmedTitle.length > 0 ? trimmedTitle : fallbackTitle,
    order: index + 1,
    isEtc: option.isOther,
    etcTitle:
      option.isOther && trimmedTitle.length > 0 ? trimmedTitle : undefined,
  };
};

const mapQuestionToItem = (
  question: QuestionConfig,
  order: number
): CreateRecruitmentItemRequest | null => {
  const trimmedTitle = question.title.trim();
  const title = trimmedTitle.length > 0 ? trimmedTitle : `질문 ${order}`;

  const trimmedDescription = question.description?.trim() ?? "";
  const description =
    trimmedDescription.length > 0 ? trimmedDescription : "내용 없음";

  switch (question.type) {
    case "single-check":
    case "multi-check": {
      const options =
        question.options?.map((option, index) => buildOption(option, index)) ??
        [];

      return {
        type: "SELECT",
        required: question.isRequired,
        title,
        order,
        description,
        multiple: question.type === "multi-check",
        options,
      };
    }
    case "short-answer":
    case "long-answer": {
      return {
        type: "TEXT",
        required: question.isRequired,
        title,
        order,
        description,
        maxLength: question.type === "short-answer" ? 255 : 1000,
      };
    }
    case "date-picker": {
      return {
        type: "CALENDAR",
        required: question.isRequired,
        title,
        order,
        description,
        date: question.dateValue ?? undefined,
      };
    }
    case "description": {
      return {
        type: "ANNOUNCEMENT",
        required: false,
        title,
        order,
        description,
        announcement: description,
      };
    }
    default:
      return null;
  }
};

export const buildCreateRecruitmentRequest = ({
  formName,
  startDate,
  startTime,
  endDate,
  endTime,
  questions,
}: BuildRecruitmentRequestParams): CreateRecruitmentRequest => {
  const name = formName.trim().length > 0 ? formName.trim() : "무제 지원서";

  const startAt = mergeDateAndTime(startDate, startTime);
  const endAt = mergeDateAndTime(endDate, endTime);

  const fixedItems: CreateRecruitmentItemRequest[] = FIXED_FIELDS.map(
    (field, index) => ({
      type: "TEXT",
      required: true,
      title: field.label,
      order: index + 1,
      description: field.placeholder,
      maxLength: 255,
    })
  );

  const dynamicItems = questions
    .map((question, index) =>
      mapQuestionToItem(question, index + fixedItems.length + 1)
    )
    .filter((item): item is CreateRecruitmentItemRequest => item !== null);

  const items = [...fixedItems, ...dynamicItems];

  const request: CreateRecruitmentRequest = {
    name,
    items,
  };

  if (endAt) {
    request.endAt = endAt;
  }

  if (startAt && endAt) {
    request.isActive = true;
  }

  return request;
};
