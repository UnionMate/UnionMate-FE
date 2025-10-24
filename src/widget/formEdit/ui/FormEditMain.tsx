import clsx from "clsx";
import {
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
import { useFormEditContext } from "../context/useFormEditContext";
import { FIXED_FIELDS, MAX_OPTIONS } from "../constants";
import type { FixedField } from "../constants";
import type { QuestionConfig, QuestionOption, QuestionType } from "../types";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, "0")
);
const MINUTE_OPTIONS = ["00", "30"];

const startOfDay = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const mergeDateAndTime = (date: Date, time: string) => {
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
  return merged;
};

const formatDisplayDateTime = (date: Date | null, time: string) => {
  if (!date) return "-";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day} ${time}`;
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
  id: QuestionType;
  label: string;
  icon: LucideIcon;
};

const QUESTION_TOOLS: QuestionTool[] = [
  { id: "single-check", label: "단일 체크", icon: CheckSquare },
  { id: "multi-check", label: "복수 체크", icon: ListChecks },
  { id: "short-answer", label: "단문형 답변", icon: TextCursorInput },
  { id: "long-answer", label: "장문형 답변", icon: FileText },
  { id: "date-picker", label: "날짜 선택", icon: CalendarCheck },
  { id: "description", label: "설명 추가", icon: FileText },
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
    multiple: type === "multi-check",
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
    maxLength: type === "short-answer" ? 100 : 1000,
    multiple: type === "long-answer",
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

const createDescriptionQuestion = (): QuestionConfig => {
  return {
    id: createId(),
    type: "description",
    title: "",
    description: "",
    isRequired: false,
  };
};

type FormEditMainProps = {
  registerQuestionRef: (
    questionId: string,
    node: HTMLDivElement | null
  ) => void;
  onRemoveQuestion: (questionId: string) => void;
};

const FormEditMain = ({
  registerQuestionRef,
  onRemoveQuestion,
}: FormEditMainProps) => {
  const {
    formName,
    setFormName,
    endDate,
    setEndDate,
    endTime,
    setEndTime,
    questions,
    setQuestions,
    resetPeriod,
  } = useFormEditContext();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<QuestionType>(
    QUESTION_TOOLS[0]?.id ?? "single-check"
  );
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    if (!isPickerOpen) return;

    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  }, [isPickerOpen]);

  const calendarDays = useMemo(
    () => buildCalendarDays(currentMonth),
    [currentMonth]
  );

  const handleToolClick = (toolId: QuestionType) => {
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

      if (toolId === "date-picker") {
        return [...prev, createDateQuestion()];
      }

      if (toolId === "description") {
        return [...prev, createDescriptionQuestion()];
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

  const handleMaxLengthChange = (questionId: string, value: number) => {
    updateQuestion(questionId, (question) => ({
      ...question,
      maxLength: value,
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
    resetPeriod();
  };

  const handleDateClick = (date: Date) => {
    const normalized = startOfDay(date);
    setEndDate(normalized);
  };

  const endDateTime = useMemo(
    () => (endDate ? mergeDateAndTime(endDate, endTime) : null),
    [endDate, endTime]
  );

  const hasCompletedRange = Boolean(endDateTime);
  const endValue = endDate ? endDate.getTime() : null;

  const handleEndTimeChange = (value: string) => {
    setEndTime(value);
  };

  return (
    <div className="flex h-full w-full gap-6 bg-black-15 px-10 pt-10 pb-24 overflow-y-auto">
      <div className="flex h-full w-full flex-col gap-6 pb-12">
        <input
          value={formName}
          onChange={(event) => setFormName(event.target.value)}
          className="w-full rounded-xl bg-white px-5 py-4 text-title-16-semibold text-black-100 shadow-sm placeholder:text-black-35 focus:outline-none focus:ring-2 focus:ring-primary/60"
          placeholder="지원서 양식의 제목을 입력해주세요"
        />

        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0px_12px_32px_rgba(128,202,20,0.05)]">
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
                지원 기간 종료일
              </span>
              <span className="text-title-16-bold text-primary">
                {formatDisplayDateTime(endDate, endTime)}
              </span>
            </div>
          </div>

          {isPickerOpen && (
            <div className="mt-2 w-full max-w-[640px] rounded-3xl border border-primary/30 bg-white p-6 shadow-[0px_12px_32px_rgba(128,202,20,0.08)]">
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-primary">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="rounded-full p-2 transition hover:bg-primary/10"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-title-18-bold text-black-100">
                        {currentMonth.getFullYear()}년{" "}
                        {currentMonth.getMonth() + 1}월
                      </span>
                      <span className="text-15-medium text-primary">
                        접수 기간은 수정이 가능해요
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="rounded-full p-2 transition hover:bg-primary/10"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-7 gap-y-2 text-center text-15-medium text-primary">
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
                      const isRangeEnd =
                        endValue !== null && timeValue === endValue;

                      const rangeWrapperClass = clsx(
                        "relative flex h-10 w-full items-center justify-center",
                        isRangeEnd && "bg-primary/10 rounded-full"
                      );

                      const dayButtonClass = clsx(
                        "z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm transition",
                        isCurrentMonth ? "text-black-90" : "text-black-35",
                        !isRangeEnd && isCurrentMonth && "hover:bg-primary/10",
                        isRangeEnd && "bg-primary text-white font-semibold"
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
                </div>

                <div className="flex w-full sm:w-[220px] flex-col gap-4">
                  <TimePickerPanel
                    label="종료 시간"
                    selectedTime={endTime}
                    onChange={handleEndTimeChange}
                    disabled={!endDate}
                    disabledMessage="종료일을 먼저 선택하세요."
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg border border-primary/30 px-4 py-2 text-title-14-semibold text-primary transition hover:bg-primary/10"
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
                      ? "bg-primary text-white hover:opacity-90"
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
              className={clsx(
                "mb-6",
                index === questions.length - 1 && "mb-12"
              )}
            >
              <QuestionComponents
                question={question}
                onChangeTitle={handleQuestionTitleChange}
                onChangeDescription={handleQuestionDescriptionChange}
                onToggleRequired={handleToggleRequired}
                onChangeOption={handleOptionTextChange}
                onChangeMaxLength={handleMaxLengthChange}
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
                    ? "border-primary/40 bg-primary/10 shadow-[0px_6px_20px_rgba(128,202,20,0.12)]"
                    : "border-transparent bg-transparent hover:border-primary/20 hover:bg-primary/10"
                )}
              >
                <span
                  className={clsx(
                    "flex h-10 w-10 items-center justify-center rounded-xl text-primary transition",
                    isActive
                      ? "bg-primary/20"
                      : "bg-primary/10 group-hover:bg-primary/20"
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span
                  className={clsx(
                    "text-title-16-semibold",
                    isActive
                      ? "text-primary"
                      : "text-black-80 group-hover:text-primary"
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

type TimePickerPanelProps = {
  label: string;
  selectedTime: string;
  onChange: (value: string) => void;
  disabled: boolean;
  disabledMessage?: string;
  hideContentWhenDisabled?: boolean;
};

const TimePickerPanel = ({
  label,
  selectedTime,
  onChange,
  disabled,
  disabledMessage,
  hideContentWhenDisabled,
}: TimePickerPanelProps) => {
  const [rawHour = "00", rawMinute = "00"] = selectedTime.split(":");
  const selectedHour = rawHour.padStart(2, "0");
  const selectedMinute = rawMinute.padStart(2, "0");

  const handleHourSelect = (hour: string) => {
    if (disabled) return;
    onChange(`${hour}:${selectedMinute}`);
  };

  const handleMinuteSelect = (minute: string) => {
    if (disabled) return;
    onChange(`${selectedHour}:${minute}`);
  };

  const pickerButtonClass = (isSelected: boolean) =>
    clsx(
      "w-full rounded-xl px-3 py-2 text-center text-15-medium transition",
      isSelected
        ? "bg-primary text-white shadow-[0px_6px_20px_rgba(128,202,20,0.15)]"
        : "bg-black-5 text-black-80 hover:bg-primary/10 hover:text-primary",
      disabled &&
        "!cursor-not-allowed !bg-black-10 !text-black-35 hover:!bg-black-10 hover:!text-black-35"
    );

  return (
    <div className="relative rounded-3xl border border-primary/20 bg-white p-4 shadow-[0px_12px_32px_rgba(128,202,20,0.08)]">
      <div
        className={clsx(
          "relative z-10 flex flex-col gap-3",
          disabled && hideContentWhenDisabled && "opacity-0"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-title-16-semibold text-black-90">{label}</span>
          <span className="text-15-medium text-primary">
            {`${selectedHour}:${selectedMinute}`}
          </span>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <span className="text-13-medium text-black-40">시간</span>
            <div className="mt-2 max-h-48 space-y-2 overflow-y-auto pr-1">
              {HOUR_OPTIONS.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  onClick={() => handleHourSelect(hour)}
                  disabled={disabled}
                  className={pickerButtonClass(hour === selectedHour)}
                >
                  {hour}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <span className="text-13-medium text-black-40">분</span>
            <div className="mt-2 max-h-48 space-y-2 overflow-y-auto pr-1">
              {MINUTE_OPTIONS.map((minute) => (
                <button
                  key={minute}
                  type="button"
                  onClick={() => handleMinuteSelect(minute)}
                  disabled={disabled}
                  className={pickerButtonClass(minute === selectedMinute)}
                >
                  {minute}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {disabled && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-white/80 backdrop-blur-sm">
          {disabledMessage && (
            <span className="px-6 text-center text-13-medium text-black-45">
              {disabledMessage}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

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
        "rounded-3xl border border-primary/20 bg-white px-8 py-6 shadow-[0px_16px_40px_rgba(128,202,20,0.06)]",
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
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            고정 항목
          </span>
        </div>

        <input
          type={field.type}
          disabled
          readOnly
          placeholder={field.placeholder}
          className="w-full rounded-xl border border-primary/20 bg-black-5 px-4 py-3 text-16-medium text-black-45 placeholder:text-black-35"
        />

        <span className="text-13-medium text-black-35">
          이 질문은 기본 항목으로 수정하거나 삭제할 수 없어요.
        </span>
      </div>
    </div>
  );
};
