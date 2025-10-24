import clsx from "clsx";
import {
  CalendarDays,
  MinusCircle,
  Plus,
  Square,
  SquareCheck,
  Trash2,
} from "lucide-react";
import type { QuestionConfig, QuestionOption } from "../types";
import { useMemo } from "react";

const formatDisplayDate = (value: string | null | undefined) => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${year}.${month}.${day}`;
};

type ChoiceVariant = Extract<
  QuestionConfig["type"],
  "single-check" | "multi-check"
>;

type QuestionComponentsProps = {
  question: QuestionConfig;
  onChangeTitle: (questionId: string, value: string) => void;
  onChangeDescription: (questionId: string, value: string) => void;
  onToggleRequired: (questionId: string) => void;
  onChangeOption: (questionId: string, optionId: string, value: string) => void;
  onChangeMaxLength: (questionId: string, value: number) => void;
  onAddOption: (questionId: string) => void;
  onRemoveOption: (questionId: string, optionId: string) => void;
  onRemoveQuestion: (questionId: string) => void;
  maxOptions: number;
};

const QuestionComponents = ({
  question,
  onChangeTitle,
  onChangeDescription,
  onToggleRequired,
  onChangeOption,
  onChangeMaxLength,
  onAddOption,
  onRemoveOption,
  onRemoveQuestion,
  maxOptions,
}: QuestionComponentsProps) => {
  if (question.type === "single-check" || question.type === "multi-check") {
    return (
      <ChoiceQuestionCard
        question={question}
        onChangeTitle={onChangeTitle}
        onChangeDescription={onChangeDescription}
        onToggleRequired={onToggleRequired}
        onChangeOption={onChangeOption}
        onAddOption={onAddOption}
        onRemoveOption={onRemoveOption}
        onRemoveQuestion={onRemoveQuestion}
        maxOptions={maxOptions}
        variant={question.type as ChoiceVariant}
      />
    );
  }

  if (question.type === "short-answer" || question.type === "long-answer") {
    return (
      <TextQuestionCard
        question={question}
        onChangeTitle={onChangeTitle}
        onChangeDescription={onChangeDescription}
        onToggleRequired={onToggleRequired}
        onChangeMaxLength={onChangeMaxLength}
        onRemoveQuestion={onRemoveQuestion}
        variant={question.type}
      />
    );
  }

  if (question.type === "date-picker") {
    return (
      <DateQuestionCard
        question={question}
        onChangeTitle={onChangeTitle}
        onChangeDescription={onChangeDescription}
        onToggleRequired={onToggleRequired}
        onRemoveQuestion={onRemoveQuestion}
      />
    );
  }

  if (question.type === "description") {
    return (
      <DescriptionQuestionCard
        question={question}
        onChangeTitle={onChangeTitle}
        onChangeDescription={onChangeDescription}
        onRemoveQuestion={onRemoveQuestion}
      />
    );
  }

  return null;
};

type ChoiceQuestionProps = {
  question: QuestionConfig;
  onChangeTitle: (questionId: string, value: string) => void;
  onChangeDescription: (questionId: string, value: string) => void;
  onToggleRequired: (questionId: string) => void;
  onChangeOption: (questionId: string, optionId: string, value: string) => void;
  onAddOption: (questionId: string) => void;
  onRemoveOption: (questionId: string, optionId: string) => void;
  onRemoveQuestion: (questionId: string) => void;
  maxOptions: number;
  variant: ChoiceVariant;
};

const ChoiceQuestionCard = ({
  question,
  onChangeTitle,
  onChangeDescription,
  onToggleRequired,
  onChangeOption,
  onAddOption,
  onRemoveOption,
  onRemoveQuestion,
  maxOptions,
  variant,
}: ChoiceQuestionProps) => {
  const optionCount = question.options?.length ?? 0;
  const canAddOption = optionCount < maxOptions;
  const badgeLabel = variant === "multi-check" ? "복수 체크" : "단일 체크";

  return (
    <div className="rounded-3xl border border-primary/20 bg-white px-8 py-6 shadow-[0px_16px_40px_rgba(128,202,20,0.06)]">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-1 items-center gap-2">
              <input
                type="text"
                value={question.title}
                onChange={(event) =>
                  onChangeTitle(question.id, event.target.value)
                }
                placeholder="질문을 입력하세요."
                className="w-full border-none bg-transparent text-title-18-semibold text-black-80 placeholder:text-black-40 focus:outline-none"
              />
              {question.isRequired && <span className="text-[#FF5F7B]">*</span>}
            </div>
            <span
              className={clsx(
                "rounded-full px-3 py-1 text-xs font-semibold",
                variant === "multi-check"
                  ? "bg-black-10 text-black-80"
                  : "bg-black-5 text-black-70"
              )}
            >
              {badgeLabel}
            </span>
          </div>
          <div className="border-b-2 border-black-15" />
          <input
            type="text"
            value={question.description}
            onChange={(event) =>
              onChangeDescription(question.id, event.target.value)
            }
            className="w-full border-b border-black-10 bg-transparent pb-2 text-16-medium text-black-80 placeholder:text-black-35 focus:border-black-30 focus:outline-none"
            placeholder="질문에 대한 설명을 입력하세요."
          />
        </div>
        <div className="flex items-center gap-2 pt-2 text-15-medium text-primary">
          <span>필수 응답</span>
          <Toggle
            isActive={question.isRequired}
            onToggle={() => onToggleRequired(question.id)}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {question.options?.map((option, index) => (
          <OptionRow
            key={option.id}
            option={option}
            hasDivider={index < optionCount - 1}
            onChange={(value) => onChangeOption(question.id, option.id, value)}
            onRemove={() => onRemoveOption(question.id, option.id)}
            disableRemove={optionCount <= 1}
            variant={variant}
          />
        ))}
      </div>

      {canAddOption ? (
        <button
          type="button"
          onClick={() => onAddOption(question.id)}
          className="mt-5 flex items-center gap-2 text-16-semibold text-black-80 transition hover:text-black-100"
        >
          <Plus className="h-5 w-5" />
          선택지 추가
        </button>
      ) : null}

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => onRemoveQuestion(question.id)}
          className="rounded-full border border-transparent p-2 text-black-30 transition hover:border-[#FFE4E4] hover:bg-[#FFF6F6] hover:text-[#FF6B6B]"
          aria-label="질문 삭제"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

type TextQuestionProps = {
  question: QuestionConfig;
  onChangeTitle: (questionId: string, value: string) => void;
  onChangeDescription: (questionId: string, value: string) => void;
  onToggleRequired: (questionId: string) => void;
  onChangeMaxLength: (questionId: string, value: number) => void;
  onRemoveQuestion: (questionId: string) => void;
  variant: Extract<QuestionConfig["type"], "short-answer" | "long-answer">;
};

const TextQuestionCard = ({
  question,
  onChangeTitle,
  onChangeDescription,
  onToggleRequired,
  onChangeMaxLength,
  onRemoveQuestion,
  variant,
}: TextQuestionProps) => {
  const badgeLabel = variant === "long-answer" ? "장문형 답변" : "단문형 답변";
  const badgeClass =
    variant === "long-answer"
      ? "bg-black-10 text-black-80"
      : "bg-black-5 text-black-70";

  return (
    <div className="rounded-3xl border border-primary/20 bg-white px-8 py-6 shadow-[0px_16px_40px_rgba(128,202,20,0.06)]">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-1 items-center gap-2">
              <input
                type="text"
                value={question.title}
                onChange={(event) =>
                  onChangeTitle(question.id, event.target.value)
                }
                placeholder="질문을 입력하세요."
                className="w-full border-none bg-transparent text-title-18-semibold text-black-80 placeholder:text-black-40 focus:outline-none"
              />
              {question.isRequired && <span className="text-[#FF5F7B]">*</span>}
            </div>
            <span
              className={clsx(
                "rounded-full px-3 py-1 text-xs font-semibold",
                badgeClass
              )}
            >
              {badgeLabel}
            </span>
          </div>
          <div className="border-b-2 border-black-15" />
          <input
            type="text"
            value={question.description}
            onChange={(event) =>
              onChangeDescription(question.id, event.target.value)
            }
            className="w-full border-b border-black-10 bg-transparent pb-2 text-16-medium text-black-80 placeholder:text-black-35 focus:border-black-30 focus:outline-none"
            placeholder="질문에 대한 설명을 입력하세요."
          />
        </div>
        <div className="flex items-center gap-2 pt-2 text-15-medium text-primary">
          <span>필수 응답</span>
          <Toggle
            isActive={question.isRequired}
            onToggle={() => onToggleRequired(question.id)}
          />
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <span className="pl-3 text-15-medium text-black-60">
          답변 최대 글자 수
        </span>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={
              question.maxLength ?? (variant === "short-answer" ? 100 : 1000)
            }
            onChange={(event) => {
              const value = parseInt(event.target.value, 10);
              if (!isNaN(value) && value > 0) {
                onChangeMaxLength(question.id, value);
              }
            }}
            min="1"
            max="10000"
            className="w-24 rounded-xl border border-black-15 bg-black-5 px-4 py-3 text-16-medium text-black-80 focus:border-black-30 focus:outline-none"
            placeholder="100"
          />
          <span className="text-15-medium text-black-60">자</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => onRemoveQuestion(question.id)}
          className="rounded-full border border-transparent p-2 text-black-30 transition hover:border-[#FFE4E4] hover:bg-[#FFF6F6] hover:text-[#FF6B6B]"
          aria-label="질문 삭제"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

type DateQuestionProps = {
  question: QuestionConfig;
  onChangeTitle: (questionId: string, value: string) => void;
  onChangeDescription: (questionId: string, value: string) => void;
  onToggleRequired: (questionId: string) => void;
  onRemoveQuestion: (questionId: string) => void;
};

const DateQuestionCard = ({
  question,
  onChangeTitle,
  onChangeDescription,
  onToggleRequired,
  onRemoveQuestion,
}: DateQuestionProps) => {
  const hasDate = Boolean(question.dateValue && question.dateValue.length > 0);
  const displayDate = useMemo(() => {
    if (!hasDate) return "날짜 데이터가 입력됩니다.";
    return formatDisplayDate(question.dateValue);
  }, [hasDate, question.dateValue]);

  return (
    <div className="rounded-3xl border border-primary/20 bg-white px-8 py-6 shadow-[0px_16px_40px_rgba(128,202,20,0.06)]">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-1 items-center gap-2">
              <input
                type="text"
                value={question.title}
                onChange={(event) =>
                  onChangeTitle(question.id, event.target.value)
                }
                placeholder="질문을 입력하세요."
                className="w-full border-none bg-transparent text-title-18-semibold text-black-80 placeholder:text-black-40 focus:outline-none"
              />
              {question.isRequired && <span className="text-[#FF5F7B]">*</span>}
            </div>
            <span className="rounded-full bg-black-5 px-3 py-1 text-xs font-semibold text-black-70">
              날짜 선택
            </span>
          </div>
          <div className="border-b-2 border-black-15" />
          <input
            type="text"
            value={question.description}
            onChange={(event) =>
              onChangeDescription(question.id, event.target.value)
            }
            className="w-full border-b border-black-10 bg-transparent pb-2 text-16-medium text-black-80 placeholder:text-black-35 focus:border-black-30 focus:outline-none"
            placeholder="질문에 대한 설명을 입력하세요."
          />
        </div>
        <div className="flex items-center gap-2 pt-2 text-15-medium text-primary">
          <span>필수 응답</span>
          <Toggle
            isActive={question.isRequired}
            onToggle={() => onToggleRequired(question.id)}
          />
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-black-15 bg-black-5 px-6 py-6">
        <div className="flex items-center justify-between gap-4">
          <span
            className={clsx(
              "text-title-16-semibold",
              hasDate ? "text-black-80" : "text-black-40"
            )}
          >
            {displayDate}
          </span>
          <div className="flex items-center gap-2 rounded-xl border border-black-15 bg-white px-4 py-2 text-15-medium text-black-70">
            <CalendarDays className="h-4 w-4" />
            <span>달력 열기</span>
          </div>
        </div>

        <p className="mt-4 rounded-xl bg-white px-4 py-3 text-15-medium text-black-50">
          실제 지원자는 이 버튼을 눌러 날짜를 선택하게 됩니다.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => onRemoveQuestion(question.id)}
          className="rounded-full border border-transparent p-2 text-black-30 transition hover:border-[#FFE4E4] hover:bg-[#FFF6F6] hover:text-[#FF6B6B]"
          aria-label="질문 삭제"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

type ToggleProps = {
  isActive: boolean;
  onToggle?: (nextValue: boolean) => void;
};

const Toggle = ({ isActive, onToggle }: ToggleProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      onClick={() => onToggle?.(!isActive)}
      className={clsx(
        "flex h-6 w-12 cursor-pointer items-center rounded-full px-1 transition focus:outline-none focus:ring-2 focus:ring-primary/40",
        isActive ? "justify-end bg-primary" : "justify-start bg-primary/20"
      )}
    >
      <span className="h-5 w-5 rounded-full bg-white shadow-sm transition-transform" />
    </button>
  );
};

type OptionRowProps = {
  option: QuestionOption;
  hasDivider: boolean;
  onChange: (value: string) => void;
  onRemove: () => void;
  disableRemove: boolean;
  variant: ChoiceVariant;
};

const OptionRow = ({
  option,
  hasDivider,
  onChange,
  onRemove,
  disableRemove,
  variant,
}: OptionRowProps) => {
  const placeholder =
    option.placeholder ?? (option.isOther ? "기타..." : "선택지를 입력하세요.");
  const OptionIcon = variant === "multi-check" ? SquareCheck : Square;

  return (
    <div className="flex items-center gap-3">
      <OptionIcon
        className={clsx(
          "h-5 w-5",
          variant === "multi-check" ? "text-black-80" : "text-black-40"
        )}
        strokeWidth={variant === "multi-check" ? 2 : 1.4}
      />
      <input
        type="text"
        value={option.text}
        onChange={(event) => onChange(event.target.value)}
        className={clsx(
          "flex-1 border-b border-transparent bg-transparent pb-1 text-16-medium text-black-80 placeholder:text-black-35 focus:border-black-30 focus:outline-none",
          hasDivider && "border-black-10"
        )}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={disableRemove}
        className="ml-2 rounded-full p-1 text-black-40 transition hover:bg-black-10 hover:text-black-80 disabled:cursor-not-allowed disabled:text-black-25 disabled:hover:bg-transparent"
        aria-label="선택지 삭제"
      >
        <MinusCircle className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
};

type DescriptionQuestionProps = {
  question: QuestionConfig;
  onChangeTitle: (questionId: string, value: string) => void;
  onChangeDescription: (questionId: string, value: string) => void;
  onRemoveQuestion: (questionId: string) => void;
};

const DescriptionQuestionCard = ({
  question,
  onChangeTitle,
  onChangeDescription,
  onRemoveQuestion,
}: DescriptionQuestionProps) => {
  return (
    <div className="rounded-3xl border border-primary/20 bg-white px-8 py-6 shadow-[0px_16px_40px_rgba(128,202,20,0.06)]">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-1 items-center gap-2">
              <input
                type="text"
                value={question.title}
                onChange={(event) =>
                  onChangeTitle(question.id, event.target.value)
                }
                placeholder="설명 제목을 입력하세요."
                className="w-full border-none bg-transparent text-title-18-semibold text-black-80 placeholder:text-black-40 focus:outline-none"
              />
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              설명 추가
            </span>
          </div>
          <div className="border-b-2 border-black-15" />
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <span className="pl-3 text-15-medium text-black-60">
          지원서 작성에 도움이 되는 설명
        </span>
        <textarea
          value={question.description}
          onChange={(event) =>
            onChangeDescription(question.id, event.target.value)
          }
          rows={6}
          className="w-full rounded-xl border border-black-15 bg-black-5 px-4 py-3 text-16-medium text-black-80 placeholder:text-black-35 focus:border-black-30 focus:outline-none"
          placeholder="지원자들이 참고할 수 있는 유용한 정보나 안내사항을 입력해주세요.&#10;예: 지원 자격, 제출 서류, 면접 일정 등"
        />
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => onRemoveQuestion(question.id)}
          className="rounded-full border border-transparent p-2 text-black-30 transition hover:border-[#FFE4E4] hover:bg-[#FFF6F6] hover:text-[#FF6B6B]"
          aria-label="설명 삭제"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default QuestionComponents;
