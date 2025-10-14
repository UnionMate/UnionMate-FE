import clsx from "clsx";
import { CalendarDays, MinusCircle, Plus, Square, SquareCheck, Trash2 } from "lucide-react";
import type { QuestionConfig, QuestionOption } from "../ui/FormEditMain";
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
  onChangePlaceholder: (questionId: string, value: string) => void;
  onChangeScaleLabel: (
    questionId: string,
    position: "min" | "max",
    value: string
  ) => void;
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
  onChangePlaceholder,
  onChangeScaleLabel,
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
        onChangePlaceholder={onChangePlaceholder}
        onRemoveQuestion={onRemoveQuestion}
        variant={question.type}
      />
    );
  }

  if (question.type === "level-check") {
    return (
      <LevelCheckQuestion
        question={question}
        onChangeTitle={onChangeTitle}
        onChangeDescription={onChangeDescription}
        onToggleRequired={onToggleRequired}
        onChangeScaleLabel={onChangeScaleLabel}
        onRemoveQuestion={onRemoveQuestion}
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
    <div className="rounded-3xl border border-[#D9E7FF] bg-white px-8 py-6 shadow-[0px_16px_40px_rgba(29,87,254,0.06)]">
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
                  ? "bg-[#E7F1FF] text-[#2F78FF]"
                  : "bg-[#F8F0FF] text-[#7C4DFF]"
              )}
            >
              {badgeLabel}
            </span>
          </div>
          <div className="border-b-2 border-[#2F78FF]" />
          <input
            type="text"
            value={question.description}
            onChange={(event) =>
              onChangeDescription(question.id, event.target.value)
            }
            className="w-full border-b border-[#E3ECFF] bg-transparent pb-2 text-16-medium text-[#4D6FBF] placeholder:text-[#7A91C9] focus:border-[#AFC9FF] focus:outline-none"
            placeholder="질문에 대한 설명을 입력하세요."
          />
        </div>
        <div className="flex items-center gap-2 pt-2 text-15-medium text-black-45">
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
          className="mt-5 flex items-center gap-2 text-16-semibold text-[#2F78FF] transition hover:text-[#1C5DFF]"
        >
          <Plus className="h-5 w-5" />
          선택지 추가
        </button>
      ) : null}

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => onRemoveQuestion(question.id)}
          className="rounded-full border border-transparent p-2 text-[#B4C4E4] transition hover:border-[#FFE4E4] hover:bg-[#FFF6F6] hover:text-[#FF6B6B]"
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
  onChangePlaceholder: (questionId: string, value: string) => void;
  onRemoveQuestion: (questionId: string) => void;
  variant: Extract<QuestionConfig["type"], "short-answer" | "long-answer">;
};

const TextQuestionCard = ({
  question,
  onChangeTitle,
  onChangeDescription,
  onToggleRequired,
  onChangePlaceholder,
  onRemoveQuestion,
  variant,
}: TextQuestionProps) => {
  const badgeLabel = variant === "long-answer" ? "장문형 답변" : "단문형 답변";
  const badgeClass =
    variant === "long-answer"
      ? "bg-[#FFF1E5] text-[#FF8A3D]"
      : "bg-[#F1F4FF] text-[#3E5AFF]";
  const placeholderHelper =
    variant === "long-answer"
      ? "답변 예시를 자유롭게 입력해주세요."
      : "간단한 답변 예시를 입력해주세요.";

  return (
    <div className="rounded-3xl border border-[#D9E7FF] bg-white px-8 py-6 shadow-[0px_16px_40px_rgba(29,87,254,0.06)]">
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
          <div className="border-b-2 border-[#2F78FF]" />
          <input
            type="text"
            value={question.description}
            onChange={(event) =>
              onChangeDescription(question.id, event.target.value)
            }
            className="w-full border-b border-[#E3ECFF] bg-transparent pb-2 text-16-medium text-[#4D6FBF] placeholder:text-[#7A91C9] focus:border-[#AFC9FF] focus:outline-none"
            placeholder="질문에 대한 설명을 입력하세요."
          />
        </div>
        <div className="flex items-center gap-2 pt-2 text-15-medium text-black-45">
          <span>필수 응답</span>
          <Toggle
            isActive={question.isRequired}
            onToggle={() => onToggleRequired(question.id)}
          />
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <span className="pl-3 text-15-medium text-[#4D6FBF]">답변 예시</span>
        {variant === "short-answer" ? (
          <input
            type="text"
            value={question.answerPlaceholder ?? ""}
            onChange={(event) =>
              onChangePlaceholder(question.id, event.target.value)
            }
            className="w-full rounded-xl border border-[#E3ECFF] bg-[#F7FAFF] px-4 py-3 text-16-medium text-[#4D6FBF] placeholder:text-[#9DB4E6] focus:border-[#AFC9FF] focus:outline-none"
            placeholder={placeholderHelper}
          />
        ) : (
          <textarea
            value={question.answerPlaceholder ?? ""}
            onChange={(event) =>
              onChangePlaceholder(question.id, event.target.value)
            }
            rows={4}
            className="w-full rounded-xl border border-[#E3ECFF] bg-[#F7FAFF] px-4 py-3 text-16-medium text-[#4D6FBF] placeholder:text-[#9DB4E6] focus:border-[#AFC9FF] focus:outline-none"
            placeholder={placeholderHelper}
          />
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => onRemoveQuestion(question.id)}
          className="rounded-full border border-transparent p-2 text-[#B4C4E4] transition hover:border-[#FFE4E4] hover:bg-[#FFF6F6] hover:text-[#FF6B6B]"
          aria-label="질문 삭제"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

type LevelQuestionProps = {
  question: QuestionConfig;
  onChangeTitle: (questionId: string, value: string) => void;
  onChangeDescription: (questionId: string, value: string) => void;
  onToggleRequired: (questionId: string) => void;
  onChangeScaleLabel: (
    questionId: string,
    position: "min" | "max",
    value: string
  ) => void;
  onRemoveQuestion: (questionId: string) => void;
};

const LevelCheckQuestion = ({
  question,
  onChangeTitle,
  onChangeDescription,
  onToggleRequired,
  onChangeScaleLabel,
  onRemoveQuestion,
}: LevelQuestionProps) => {
  const steps = question.scaleSteps ?? 10;
  const labels = Array.from({ length: steps }, (_, index) => index + 1);

  return (
    <div className="rounded-3xl border border-[#D9E7FF] bg-white px-8 py-6 shadow-[0px_16px_40px_rgba(29,87,254,0.06)]">
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
              {question.isRequired && (
                <span className="text-[#FF5F7B]">*</span>
              )}
            </div>
            <span className="rounded-full bg-[#EDF6FF] px-3 py-1 text-xs font-semibold text-[#2F78FF]">
              정도 체크
            </span>
          </div>
          <div className="border-b-2 border-[#2F78FF]" />
          <input
            type="text"
            value={question.description}
            onChange={(event) =>
              onChangeDescription(question.id, event.target.value)
            }
            className="w-full border-b border-[#E3ECFF] bg-transparent pb-2 text-16-medium text-[#4D6FBF] placeholder:text-[#7A91C9] focus:border-[#AFC9FF] focus:outline-none"
            placeholder="질문에 대한 설명을 입력하세요."
          />
        </div>
        <div className="flex items-center gap-2 pt-2 text-15-medium text-black-45">
          <span>필수 응답</span>
          <Toggle
            isActive={question.isRequired}
            onToggle={() => onToggleRequired(question.id)}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <div className="flex flex-wrap justify-center gap-6">
          {labels.map((label) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <span className="text-15-medium text-[#AFBEE0]">{label}</span>
              <div className="h-6 w-6 rounded-sm border border-[#CADAF5] bg-white" />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <label className="flex items-center gap-1 text-15-medium text-[#2F78FF]">
              <span>최하 선택지를 입력하세요.</span>
              <span className="text-[#FF5F7B]">*</span>
            </label>
            <input
              type="text"
              value={question.scaleMinLabel ?? ""}
              onChange={(event) =>
                onChangeScaleLabel(question.id, "min", event.target.value)
              }
              className="mt-2 w-full border-b-2 border-[#9AC3FF] bg-transparent pb-1 text-16-medium text-[#2F78FF] placeholder:text-[#A3BDED] focus:border-[#2F78FF] focus:outline-none"
              placeholder="예: 전혀 아니다"
            />
          </div>

          <div className="flex-1">
            <label className="flex items-center gap-1 text-15-medium text-[#2F78FF] md:justify-end">
              <span className="text-[#FF5F7B]">*</span>
              <span>최상 선택지를 입력하세요.</span>
            </label>
            <input
              type="text"
              value={question.scaleMaxLabel ?? ""}
              onChange={(event) =>
                onChangeScaleLabel(question.id, "max", event.target.value)
              }
              className="mt-2 w-full border-b-2 border-[#9AC3FF] bg-transparent pb-1 text-16-medium text-[#2F78FF] placeholder:text-[#A3BDED] focus:border-[#2F78FF] focus:outline-none"
              placeholder="예: 매우 그렇다"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => onRemoveQuestion(question.id)}
          className="rounded-full border border-transparent p-2 text-[#B4C4E4] transition hover:border-[#FFE4E4] hover:bg-[#FFF6F6] hover:text-[#FF6B6B]"
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
    <div className="rounded-3xl border border-[#D9E7FF] bg-white px-8 py-6 shadow-[0px_16px_40px_rgba(29,87,254,0.06)]">
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
              {question.isRequired && (
                <span className="text-[#FF5F7B]">*</span>
              )}
            </div>
            <span className="rounded-full bg-[#EAFBF6] px-3 py-1 text-xs font-semibold text-[#2F78FF]">
              날짜 선택
            </span>
          </div>
          <div className="border-b-2 border-[#2F78FF]" />
          <input
            type="text"
            value={question.description}
            onChange={(event) =>
              onChangeDescription(question.id, event.target.value)
            }
            className="w-full border-b border-[#E3ECFF] bg-transparent pb-2 text-16-medium text-[#4D6FBF] placeholder:text-[#7A91C9] focus:border-[#AFC9FF] focus:outline-none"
            placeholder="질문에 대한 설명을 입력하세요."
          />
        </div>
        <div className="flex items-center gap-2 pt-2 text-15-medium text-black-45">
          <span>필수 응답</span>
          <Toggle
            isActive={question.isRequired}
            onToggle={() => onToggleRequired(question.id)}
          />
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-[#CBE0FF] bg-[#F8FBFF] px-6 py-6">
        <div className="flex items-center justify-between gap-4">
          <span
            className={clsx(
              "text-title-16-semibold",
              hasDate ? "text-[#2F78FF]" : "text-[#9DB4E6]"
            )}
          >
            {displayDate}
          </span>
          <div className="flex items-center gap-2 rounded-xl border border-[#AEC8FF] bg-white px-4 py-2 text-15-medium text-[#2F78FF]">
            <CalendarDays className="h-4 w-4" />
            <span>달력 열기</span>
          </div>
        </div>

        <p className="mt-4 rounded-xl bg-white px-4 py-3 text-15-medium text-[#7A91C9]">
          실제 지원자는 이 버튼을 눌러 날짜를 선택하게 됩니다.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => onRemoveQuestion(question.id)}
          className="rounded-full border border-transparent p-2 text-[#B4C4E4] transition hover:border-[#FFE4E4] hover:bg-[#FFF6F6] hover:text-[#FF6B6B]"
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
        "flex h-6 w-12 cursor-pointer items-center rounded-full px-1 transition focus:outline-none focus:ring-2 focus:ring-[#BBD5FF]",
        isActive ? "justify-end bg-[#2F78FF]" : "justify-start bg-[#D2DEF6]"
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
          variant === "multi-check" ? "text-[#2F78FF]" : "text-[#9FB6E8]"
        )}
        strokeWidth={variant === "multi-check" ? 2 : 1.4}
      />
      <input
        type="text"
        value={option.text}
        onChange={(event) => onChange(event.target.value)}
        className={clsx(
          "flex-1 border-b border-transparent bg-transparent pb-1 text-16-medium text-[#4D6FBF] placeholder:text-[#7A91C9] focus:border-[#AFC9FF] focus:outline-none",
          hasDivider && "border-[#E3ECFF]"
        )}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={disableRemove}
        className="ml-2 rounded-full p-1 text-[#9FB6E8] transition hover:bg-[#EFF4FF] hover:text-[#2F78FF] disabled:cursor-not-allowed disabled:text-[#D3DCF3] disabled:hover:bg-transparent"
        aria-label="선택지 삭제"
      >
        <MinusCircle className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
};

export default QuestionComponents;
