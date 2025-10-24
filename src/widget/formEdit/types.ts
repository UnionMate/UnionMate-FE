export type QuestionType =
  | "single-check"
  | "multi-check"
  | "short-answer"
  | "long-answer"
  | "date-picker"
  | "description";

export type QuestionOption = {
  id: string;
  text: string;
  helper?: boolean;
  placeholder?: string;
  isOther?: boolean;
};

export type QuestionConfig = {
  id: string;
  type: QuestionType;
  title: string;
  description: string;
  isRequired: boolean;
  options?: QuestionOption[];
  answerPlaceholder?: string;
  dateValue?: string;
  maxLength?: number;
  multiple?: boolean;
};
