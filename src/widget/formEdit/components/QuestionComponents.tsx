import { MinusCircle, Plus, Square, SquareCheck, Trash2 } from "lucide-react";
import type { QuestionConfig, QuestionOption } from "../ui/FormEditMain";
import clsx from "clsx";

type ChoiceVariant = Extract<QuestionConfig["type"], "single-check" | "multi-check">;

type QuestionComponentsProps = {
  question: QuestionConfig;
  onChangeTitle: (questionId: string, value: string) => void;
  onChangeDescription: (questionId: string, value: string) => void;
  onToggleRequired: (questionId: string) => void;
  onChangeOption: (questionId: string, optionId: string, value: string) => void;
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
              {question.isRequired && (
                <span className="text-[#FF5F7B]">*</span>
              )}
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
