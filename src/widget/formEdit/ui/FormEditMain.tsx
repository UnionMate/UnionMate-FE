import clsx from "clsx";
import {
  BarChart2,
  CalendarCheck,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FileText,
  ListChecks,
  TextCursorInput,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import QuestionComponents from "../components/QuestionComponents";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const startOfDay = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const isSameDay = (a: Date | null, b: Date | null) => {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const formatDisplayDate = (date: Date | null) => {
  if (!date) return "-";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const buildCalendarDays = (base: Date) => {
  const year = base.getFullYear();
  const month = base.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstWeekday = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  const totalCells = Math.ceil((firstWeekday + totalDays) / 7) * 7;
  const startDate = new Date(year, month, 1 - firstWeekday);

  return Array.from({ length: totalCells }, (_, index) => {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + index);
    return cellDate;
  });
};

type QuestionTool = {
  id: string;
  label: string;
  icon: LucideIcon;
};

type QuestionType =
  | "single-check"
  | "multi-check"
  | "short-answer"
  | "long-answer"
  | "level-check"
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
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  scaleSteps?: number;
  dateValue?: string;
};

const MAX_OPTIONS = 5;

const QUESTION_TOOLS: QuestionTool[] = [
  { id: "single-check", label: "단일 체크", icon: CheckSquare },
  { id: "multi-check", label: "복수 체크", icon: ListChecks },
  { id: "short-answer", label: "단문형 답변", icon: TextCursorInput },
  { id: "long-answer", label: "장문형 답변", icon: FileText },
  { id: "level-check", label: "정도 체크", icon: BarChart2 },
  { id: "date-picker", label: "날짜 선택", icon: CalendarCheck },
];

const FIXED_FIELDS = [
  {
    id: "applicant-name",
    label: "이름",
    description: "지원자의 이름을 입력받아요.",
    placeholder: "이름을 입력해주세요.",
    type: "text" as const,
  },
  {
    id: "applicant-phone",
    label: "전화번호",
    description: "연락 가능한 전화번호를 입력받아요.",
    placeholder: "전화번호를 입력해주세요.",
    type: "tel" as const,
  },
  {
    id: "applicant-email",
    label: "이메일",
    description: "지원자의 이메일 주소를 입력받아요.",
    placeholder: "이메일을 입력해주세요.",
    type: "email" as const,
  },
];

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createChoiceQuestion = (
  type: Extract<QuestionType, "single-check" | "multi-check">
): QuestionConfig => {
  return {
    id: createId(),
    type,
    title: "",
    description: "",
    isRequired: true,
    options: Array.from({ length: 2 }, () => ({
      id: createId(),
      text: "",
      helper: true,
      placeholder: "선택지를 입력하세요.",
    })),
  };
};

const createTextQuestion = (
  type: Extract<QuestionType, "short-answer" | "long-answer">
): QuestionConfig => {
  return {
    id: createId(),
    type,
    title: "",
    description: "",
    isRequired: true,
  };
};

const createScaleQuestion = (): QuestionConfig => {
  return {
    id: createId(),
    type: "level-check",
    title: "",
    description: "",
    isRequired: true,
    scaleSteps: 10,
    scaleMinLabel: "",
    scaleMaxLabel: "",
  };
};

const createDateQuestion = (): QuestionConfig => {
  return {
    id: createId(),
    type: "date-picker",
    title: "",
    description: "",
    isRequired: true,
    dateValue: "",
  };
};

type FormEditMainProps = {
  questions: QuestionConfig[];
  setQuestions: React.Dispatch<React.SetStateAction<QuestionConfig[]>>;
  registerQuestionRef: (
    questionId: string,
    node: HTMLDivElement | null
  ) => void;
  onRemoveQuestion: (questionId: string) => void;
};

const FormEditMain = ({
  questions,
  setQuestions,
  registerQuestionRef,
  onRemoveQuestion,
}: FormEditMainProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>(
    QUESTION_TOOLS[0]?.id ?? ""
  );
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    if (!isPickerOpen) return;

    if (startDate) {
      setCurrentMonth(
        new Date(startDate.getFullYear(), startDate.getMonth(), 1)
      );
      return;
    }

    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  }, [isPickerOpen, startDate]);

  const calendarDays = useMemo(
    () => buildCalendarDays(currentMonth),
    [currentMonth]
  );

  const handleToolClick = (toolId: string) => {
    setSelectedTool(toolId);

    setQuestions((prev) => {
      if (toolId === "single-check" || toolId === "multi-check") {
        return [
          ...prev,
          createChoiceQuestion(
            toolId === "single-check" ? "single-check" : "multi-check"
          ),
        ];
      }

      if (toolId === "short-answer" || toolId === "long-answer") {
        return [
          ...prev,
          createTextQuestion(
            toolId === "short-answer" ? "short-answer" : "long-answer"
          ),
        ];
      }

      if (toolId === "level-check") {
        return [...prev, createScaleQuestion()];
      }

      if (toolId === "date-picker") {
        return [...prev, createDateQuestion()];
      }

      return prev;
    });
  };

  const updateQuestion = (
    questionId: string,
    updater: (question: QuestionConfig) => QuestionConfig
  ) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId ? updater(question) : question
      )
    );
  };

  const handleQuestionTitleChange = (questionId: string, value: string) => {
    updateQuestion(questionId, (question) => ({
      ...question,
      title: value,
    }));
  };

  const handleQuestionDescriptionChange = (
    questionId: string,
    value: string
  ) => {
    updateQuestion(questionId, (question) => ({
      ...question,
      description: value,
    }));
  };

  const handleAnswerPlaceholderChange = (questionId: string, value: string) => {
    updateQuestion(questionId, (question) => ({
      ...question,
      answerPlaceholder: value,
    }));
  };

  const handleScaleLabelChange = (
    questionId: string,
    position: "min" | "max",
    value: string
  ) => {
    updateQuestion(questionId, (question) => ({
      ...question,
      scaleMinLabel: position === "min" ? value : question.scaleMinLabel,
      scaleMaxLabel: position === "max" ? value : question.scaleMaxLabel,
    }));
  };

  const handleToggleRequired = (questionId: string) => {
    updateQuestion(questionId, (question) => ({
      ...question,
      isRequired: !question.isRequired,
    }));
  };

  const handleOptionTextChange = (
    questionId: string,
    optionId: string,
    value: string
  ) => {
    updateQuestion(questionId, (question) => ({
      ...question,
      options: question.options?.map((option) =>
        option.id === optionId ? { ...option, text: value } : option
      ),
    }));
  };

  const handleRemoveOption = (questionId: string, optionId: string) => {
    updateQuestion(questionId, (question) => {
      const options = question.options ? [...question.options] : [];
      if (options.length <= 1) {
        return question;
      }

      return {
        ...question,
        options: options.filter((option) => option.id !== optionId),
      };
    });
  };

  const handleAddOption = (questionId: string) => {
    const newOption: QuestionOption = {
      id: createId(),
      text: "",
      helper: true,
      placeholder: "선택지를 입력하세요.",
    };

    updateQuestion(questionId, (question) => {
      const options = question.options ? [...question.options] : [];
      if (options.length >= MAX_OPTIONS) {
        return question;
      }

      options.push(newOption);

      return {
        ...question,
        options,
      };
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleDateClick = (date: Date) => {
    const normalized = startOfDay(date);

    if (!startDate || (startDate && endDate)) {
      setStartDate(normalized);
      setEndDate(null);
      return;
    }

    if (!endDate) {
      const startTime = startDate.getTime();
      const clickedTime = normalized.getTime();

      if (clickedTime < startTime) {
        setStartDate(normalized);
        setEndDate(null);
        return;
      }

      setEndDate(normalized);
    }
  };

  const hasCompletedRange = Boolean(startDate && endDate);
  const startValue = startDate ? startDate.getTime() : null;
  const endValue = endDate ? endDate.getTime() : null;
  const isSameRangeDay =
    startDate && endDate ? isSameDay(startDate, endDate) : false;

  return (
    <div className="flex h-full w-full gap-6 bg-black-15 px-10 pt-10 pb-24 overflow-y-auto">
      <div className="flex h-full w-full flex-col gap-6 pb-12">
        <input
          className="w-full rounded-xl bg-white px-5 py-4 text-title-16-semibold text-black-100 shadow-sm placeholder:text-black-35 focus:outline-none focus:ring-2 focus:ring-primary/60"
          placeholder="지원서 양식의 제목을 입력해주세요"
        />

        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0px_12px_32px_rgba(28,93,255,0.05)]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-title-16-semibold text-black-100">
                접수 기간
              </span>
              <span className="text-15-medium text-black-60">
                버튼을 눌러 접수 시작일과 종료일을 선택하세요.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsPickerOpen((prev) => !prev)}
              className="rounded-lg bg-primary px-5 py-2 text-title-14-semibold text-white transition hover:opacity-90"
            >
              {isPickerOpen ? "닫기" : "접수기간 선택"}
            </button>
          </div>

          <div className="flex items-center gap-8 rounded-xl border border-black-15 bg-black-5 px-5 py-3">
            <div className="flex flex-col gap-1">
              <span className="text-title-16-semibold text-black-80">
                시작일
              </span>
              <span className="text-title-16-bold text-primary">
                {startDate ? formatDisplayDate(startDate) : "-"}
              </span>
            </div>
            <div className="flex h-10 w-px bg-black-20" />
            <div className="flex flex-col gap-1">
              <span className="text-title-16-semibold text-black-80">
                종료일
              </span>
              <span className="text-title-16-bold text-primary">
                {endDate ? formatDisplayDate(endDate) : "-"}
              </span>
            </div>
          </div>

          {isPickerOpen && (
            <div className="mt-2 w-full max-w-[360px] rounded-3xl border border-[#C3D8FF] bg-white p-6 shadow-[0px_12px_32px_rgba(28,93,255,0.08)]">
              <div className="flex items-center justify-between text-[#2F80ED]">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="rounded-full p-2 transition hover:bg-[#E7F0FF]"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-title-18-bold text-black-100">
                    {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}
                    월
                  </span>
                  <span className="text-15-medium text-[#2F80ED]">
                    접수 기간은 수정이 가능해요
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="rounded-full p-2 transition hover:bg-[#E7F0FF]"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-7 gap-y-2 text-center text-15-medium text-[#2F80ED]">
                {DAY_LABELS.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-7 gap-y-2 text-center">
                {calendarDays.map((date) => {
                  const currentMonthIndex = currentMonth.getMonth();
                  const isCurrentMonth =
                    date.getMonth() === currentMonthIndex &&
                    date.getFullYear() === currentMonth.getFullYear();

                  const normalizedDate = startOfDay(date);
                  const timeValue = normalizedDate.getTime();
                  const isRangeStart =
                    startValue !== null && timeValue === startValue;
                  const isRangeEnd =
                    endValue !== null && timeValue === endValue;
                  const hasRange = startValue !== null && endValue !== null;
                  const isBetween =
                    hasRange &&
                    startValue !== null &&
                    endValue !== null &&
                    timeValue > startValue &&
                    timeValue < endValue;

                  const showRangeBackground =
                    hasRange &&
                    !isSameRangeDay &&
                    (isBetween || isRangeStart || isRangeEnd);

                  const rangeWrapperClass = clsx(
                    "relative flex h-10 w-full items-center justify-center",
                    showRangeBackground && "bg-[#D8EBFF]",
                    showRangeBackground &&
                      isRangeStart &&
                      !isRangeEnd &&
                      "rounded-l-full",
                    showRangeBackground &&
                      isRangeEnd &&
                      !isRangeStart &&
                      "rounded-r-full",
                    showRangeBackground &&
                      isRangeStart &&
                      isRangeEnd &&
                      "rounded-full"
                  );

                  const dayButtonClass = clsx(
                    "z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm transition",
                    isCurrentMonth ? "text-black-90" : "text-black-35",
                    !isRangeStart &&
                      !isRangeEnd &&
                      !isBetween &&
                      isCurrentMonth &&
                      "hover:bg-[#E7F0FF]",
                    isBetween && "text-[#2F80ED]",
                    (isRangeStart || isRangeEnd) &&
                      "bg-[#2F80ED] text-white font-semibold",
                    isRangeStart && isRangeEnd && "font-semibold"
                  );

                  return (
                    <div
                      key={normalizedDate.toISOString()}
                      className={rangeWrapperClass}
                    >
                      <button
                        type="button"
                        onClick={() => handleDateClick(normalizedDate)}
                        className={dayButtonClass}
                      >
                        {date.getDate()}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg border border-[#AFC9FF] px-4 py-2 text-title-14-semibold text-[#2F80ED] transition hover:bg-[#E7F0FF]"
                >
                  초기화
                </button>
                <button
                  type="button"
                  disabled={!hasCompletedRange}
                  onClick={() => setIsPickerOpen(false)}
                  className={clsx(
                    "rounded-lg px-6 py-2 text-title-14-semibold transition",
                    hasCompletedRange
                      ? "bg-[#2F80ED] text-white hover:opacity-90"
                      : "cursor-not-allowed bg-black-10 text-black-40"
                  )}
                >
                  완료
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {FIXED_FIELDS.map((field, index) => (
            <FixedQuestionCard
              key={field.id}
              field={field}
              className={clsx(
                "mb-6",
                index === FIXED_FIELDS.length - 1 && "mb-10"
              )}
            />
          ))}
        </div>

        <div className="flex flex-col">
          {questions.map((question, index) => (
            <div
              key={question.id}
              ref={(node) => registerQuestionRef(question.id, node)}
              className={clsx("mb-6", index === questions.length - 1 && "mb-12")}
            >
              <QuestionComponents
                question={question}
                onChangeTitle={handleQuestionTitleChange}
                onChangeDescription={handleQuestionDescriptionChange}
                onToggleRequired={handleToggleRequired}
                onChangeOption={handleOptionTextChange}
                onChangePlaceholder={handleAnswerPlaceholderChange}
                onChangeScaleLabel={handleScaleLabelChange}
                onAddOption={handleAddOption}
                onRemoveOption={handleRemoveOption}
                onRemoveQuestion={onRemoveQuestion}
                maxOptions={MAX_OPTIONS}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="sticky top-10 flex min-w-[260px] flex-col gap-3 rounded-3xl bg-white p-6 shadow-[0px_12px_32px_rgba(0,0,0,0.04)] h-fit self-start">
        <span className="text-title-16-semibold text-black-100">
          질문 생성 도구
        </span>
        <div className="flex flex-col gap-2">
          {QUESTION_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = selectedTool === tool.id;

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleToolClick(tool.id)}
                className={clsx(
                  "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
                  isActive
                    ? "border-[#C7DAFF] bg-[#EEF3FF] shadow-[0px_6px_20px_rgba(28,93,255,0.12)]"
                    : "border-transparent bg-transparent hover:border-[#E1E9FF] hover:bg-[#F6F8FF]"
                )}
              >
                <span
                  className={clsx(
                    "flex h-10 w-10 items-center justify-center rounded-xl text-[#3B6DFF] transition",
                    isActive
                      ? "bg-[#D1E0FF]"
                      : "bg-[#E9F0FF] group-hover:bg-[#DCE7FF]"
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span
                  className={clsx(
                    "text-title-16-semibold",
                    isActive
                      ? "text-[#2F59C4]"
                      : "text-black-80 group-hover:text-[#325ECF]"
                  )}
                >
                  {tool.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FormEditMain;

type FixedField = (typeof FIXED_FIELDS)[number];

const FixedQuestionCard = ({
  field,
  className,
}: {
  field: FixedField;
  className?: string;
}) => {
  return (
    <div
      className={clsx(
        "rounded-3xl border border-[#DCE6FF] bg-white px-8 py-6 shadow-[0px_16px_40px_rgba(29,87,254,0.06)]",
        className
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-title-18-semibold text-black-90">
              {field.label}
            </span>
            <span className="text-[#FF5F7B]">*</span>
          </div>
          <span className="rounded-full bg-[#F2F6FF] px-3 py-1 text-xs font-semibold text-[#2F59C4]">
            고정 항목
          </span>
        </div>

        <p className="text-15-medium text-black-60">{field.description}</p>

        <input
          type={field.type}
          disabled
          readOnly
          placeholder={field.placeholder}
          className="w-full rounded-xl border border-[#E3EBFF] bg-black-5 px-4 py-3 text-16-medium text-black-45 placeholder:text-black-35"
        />

        <span className="text-13-medium text-black-35">
          이 질문은 기본 항목으로 수정하거나 삭제할 수 없어요.
        </span>
      </div>
    </div>
  );
};
