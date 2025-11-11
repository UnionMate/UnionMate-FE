import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import type { ApplicantDetail, ApplicantStatus } from "../types";
import {
  APPLICANT_STATUS_OPTIONS,
  statusLabelMap,
  statusToneMap,
} from "../constants/applicants";
import {
  createApplicationComment,
  deleteApplicationComment,
  getApplicationComments,
  updateDocumentDecision,
  updateInterviewSchedule,
  updateApplicationComment,
  type UpdateInterviewScheduleRequest,
} from "@/api/application";
import { decodeJWT } from "@/lib/utils";

interface DetailMainCardProps {
  applicant: ApplicantDetail;
  applicationId: number;
  onStatusChange: (
    applicantId: string,
    status: ApplicantStatus,
    evaluationStatus?: string
  ) => void;
  onInterviewUpdate: (
    applicantId: string,
    interview: ApplicantDetail["interview"]
  ) => void;
}

const MAX_MEMO_LENGTH = 250;

const IS_DEV =
  typeof import.meta !== "undefined" && Boolean(import.meta.env?.DEV);

type FinalDecisionStatus = Extract<ApplicantStatus, "pass" | "fail">;

const DetailMainCard = ({
  applicant,
  applicationId,
  onStatusChange,
  onInterviewUpdate,
}: DetailMainCardProps) => {
  const [memoInput, setMemoInput] = useState("");
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(() =>
    parseInterviewDate(applicant.interview.rawTime)
  );
  const [selectedTime, setSelectedTime] = useState(
    toTimeValue(applicant.interview.rawTime)
  );
  const [currentMonth, setCurrentMonth] = useState(() => {
    const base = parseInterviewDate(applicant.interview.rawTime) ?? new Date();
    return startOfMonth(base);
  });
  const [scheduleStep, setScheduleStep] = useState<"date" | "time">(() =>
    parseInterviewDate(applicant.interview.rawTime) ? "time" : "date"
  );
  const [interviewPlace, setInterviewPlace] = useState(
    applicant.interview.location ?? ""
  );
  const [pendingDecision, setPendingDecision] =
    useState<FinalDecisionStatus | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const resolvedApplicationId = useMemo(() => {
    if (Number.isFinite(applicationId)) {
      return applicationId;
    }
    const numericApplicantId = Number(applicant.id);
    return Number.isFinite(numericApplicantId) ? numericApplicantId : NaN;
  }, [applicationId, applicant.id]);
  const isApplicationIdValid = Number.isFinite(resolvedApplicationId);
  const queryClient = useQueryClient();
  const managerIdentity = useMemo(() => getCurrentManagerIdentity(), []);

  const { mutate: saveInterviewSchedule, isPending: isSavingSchedule } =
    useMutation({
      mutationFn: (payload: UpdateInterviewScheduleRequest) =>
        updateInterviewSchedule(Number(applicant.id), payload),
    });

  const {
    data: commentsData,
    isLoading: isMemoLoading,
    isError: isCommentsError,
  } = useQuery({
    queryKey: ["application-comments", resolvedApplicationId],
    queryFn: () => getApplicationComments(resolvedApplicationId),
    enabled: isApplicationIdValid,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (isCommentsError) {
      toast.error("메모를 불러오지 못했습니다.");
    }
  }, [isCommentsError]);

  const invalidateComments = () => {
    queryClient.invalidateQueries({
      queryKey: ["application-comments", resolvedApplicationId],
    });
  };

  const { mutate: addComment, isPending: isAddingMemo } = useMutation({
    mutationFn: (content: string) =>
      createApplicationComment(resolvedApplicationId, { content }),
    onSuccess: () => {
      toast.success("메모가 추가되었습니다.");
      setMemoInput("");
      invalidateComments();
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "메모를 추가하지 못했습니다.";
      toast.error(message);
    },
  });

  const { mutate: editComment, isPending: isEditingMemo } = useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: number;
      content: string;
    }) =>
      updateApplicationComment(resolvedApplicationId, commentId, { content }),
    onSuccess: () => {
      toast.success("메모가 수정되었습니다.");
      setEditingMemoId(null);
      setEditingContent("");
      invalidateComments();
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "메모를 수정하지 못했습니다.";
      toast.error(message);
    },
  });

  const { mutate: removeComment, isPending: isDeletingMemo } = useMutation({
    mutationFn: (commentId: number) =>
      deleteApplicationComment(resolvedApplicationId, commentId),
    onSuccess: () => {
      toast.success("메모가 삭제되었습니다.");
      invalidateComments();
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "메모를 삭제하지 못했습니다.";
      toast.error(message);
    },
  });

  const { mutate: submitDecision, isPending: isSubmittingDecision } =
    useMutation({
      mutationFn: (decision: FinalDecisionStatus) => {
        if (!isApplicationIdValid) {
          throw new Error("유효하지 않은 지원서입니다.");
        }
        const payloadDecision = decision === "pass" ? "INTERVIEW" : "FAILED";
        return updateDocumentDecision(resolvedApplicationId, {
          decision: payloadDecision,
        });
      },
      onSuccess: (_, decision) => {
        toast.success(
          `서류 평가 결과가 ${statusLabelMap[decision]}으로 확정되었습니다.`
        );
        const evaluationStatus = decision === "pass" ? "INTERVIEW" : "FAILED";
        onStatusChange(applicant.id, decision, evaluationStatus);
        setPendingDecision(null);
      },
      onError: (error) => {
        const apiMessage = extractApiErrorMessage(error);
        const fallbackMessage =
          error instanceof Error
            ? error.message
            : "평가 결과를 저장하지 못했습니다.";
        const message = apiMessage || fallbackMessage;
        toast.error(message);
        if (IS_DEV) {
          console.error("[DocumentDecision] failed", {
            error,
            apiMessage,
          });
        }
      },
    });

  useEffect(() => {
    setMemoInput("");
    setEditingMemoId(null);
    setEditingContent("");
    const parsedDate = parseInterviewDate(applicant.interview.rawTime);
    setSelectedDate(parsedDate);
    setSelectedTime(toTimeValue(applicant.interview.rawTime));
    setInterviewPlace(applicant.interview.location ?? "");
    setCurrentMonth(startOfMonth(parsedDate ?? new Date()));
    setScheduleStep(parsedDate ? "time" : "date");
    setScheduleError(null);
  }, [applicant.id, applicant.interview.location, applicant.interview.rawTime]);

  const handleDeleteMemo = (memoId: string) => {
    if (!isApplicationIdValid) {
      toast.error("유효하지 않은 지원서입니다.");
      return;
    }
    const numericId = Number(memoId);
    if (!Number.isFinite(numericId)) {
      toast.error("잘못된 메모 정보입니다.");
      return;
    }
    removeComment(numericId);
  };

  const calendarDays = useMemo(
    () => buildCalendarDays(currentMonth),
    [currentMonth]
  );

  const handleAddMemo = () => {
    const trimmed = memoInput.trim();
    if (!trimmed) return;
    if (!isApplicationIdValid) {
      toast.error("유효하지 않은 지원서입니다.");
      return;
    }
    addComment(trimmed);
  };

  const handleStartEdit = (memoId: string, currentContent: string) => {
    setEditingMemoId(memoId);
    setEditingContent(currentContent);
  };

  const handleCancelEdit = () => {
    setEditingMemoId(null);
    setEditingContent("");
  };

  const handleSaveEdit = () => {
    if (!editingMemoId) return;
    const trimmed = editingContent.trim();
    if (!trimmed) return;
    if (!isApplicationIdValid) {
      toast.error("유효하지 않은 지원서입니다.");
      return;
    }
    const numericId = Number(editingMemoId);
    if (!Number.isFinite(numericId)) {
      toast.error("잘못된 메모 정보입니다.");
      return;
    }
    editComment({ commentId: numericId, content: trimmed });
  };

  const formattedProfile = useMemo(
    () => applicant.profile,
    [applicant.profile]
  );

  const comments = commentsData?.data;

  useEffect(() => {
    if (IS_DEV) {
      console.debug(
        "[DetailMainCard] manager identity resolved:",
        managerIdentity
      );
    }
  }, [managerIdentity]);

  const memoItems = useMemo(() => {
    if (Array.isArray(comments)) {
      return comments.map((comment) => ({
        id: String(comment.commentId),
        author: comment.councilManagerName,
        content: comment.content,
        isMine: isCommentMine(
          managerIdentity,
          comment.councilManagerId,
          comment.councilManagerName
        ),
        createdAt: comment.updatedAt ?? comment.createdAt,
      }));
    }
    return applicant.memos;
  }, [applicant.memos, comments, managerIdentity]);

  useEffect(() => {
    if (!editingMemoId) {
      return;
    }

    const stillExists = memoItems.some((memo) => memo.id === editingMemoId);

    if (!stillExists) {
      setEditingMemoId(null);
      setEditingContent("");
    }
  }, [memoItems, editingMemoId]);

  const formatSubmittedAt = (raw: string) => {
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
      return raw;
    }

    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    return `서류 제출일 ${yy}.${mm}.${dd} ${hh}:${mi}`;
  };

  const formatMemoDate = (raw: string) => {
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
      return raw;
    }

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")} ${String(
      date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const handleSaveSchedule = () => {
    setScheduleError(null);
    if (!selectedDate || !selectedTime || !interviewPlace.trim()) {
      setScheduleError("면접 일시와 장소를 모두 입력해주세요.");
      return;
    }

    if (!isValidTimeValue(selectedTime)) {
      setScheduleError("면접 시간을 다시 선택해주세요.");
      return;
    }

    const mergedDate = mergeDateAndTime(selectedDate, selectedTime);
    if (!mergedDate) {
      setScheduleError("유효한 면접 일시를 선택해주세요.");
      return;
    }

    const isoTime = mergedDate.toISOString();
    const trimmedPlace = interviewPlace.trim();
    const numericId = Number(applicant.id);
    if (Number.isNaN(numericId)) {
      setScheduleError("면접 일정을 수정할 수 없는 지원자입니다.");
      return;
    }

    saveInterviewSchedule(
      { time: isoTime, place: trimmedPlace },
      {
        onSuccess: () => {
          toast.success("면접 일정이 저장되었습니다.");
          onInterviewUpdate(applicant.id, {
            date: formatDisplayDate(isoTime),
            time: formatDisplayTime(isoTime),
            location: trimmedPlace,
            rawTime: isoTime,
          });
        },
        onError: (error) => {
          const message =
            error instanceof Error
              ? error.message
              : "면접 일정을 저장하지 못했습니다.";
          setScheduleError(message);
          toast.error(message);
        },
      }
    );
  };

  const statusButtonsDisabled =
    applicant.status !== "pending" || isSubmittingDecision;
  const isDecisionModalOpen = pendingDecision !== null;

  const handleStatusButtonClick = (status: ApplicantStatus) => {
    if (status === "pending") {
      return;
    }
    if (!isApplicationIdValid) {
      toast.error("유효하지 않은 지원서입니다.");
      return;
    }
    if (applicant.status !== "pending") {
      return;
    }
    setPendingDecision(status);
  };

  const handleDecisionModalClose = () => {
    if (isSubmittingDecision) {
      return;
    }
    setPendingDecision(null);
  };

  const handleConfirmDecision = () => {
    if (!pendingDecision) {
      return;
    }
    if (!isApplicationIdValid) {
      toast.error("유효하지 않은 지원서입니다.");
      return;
    }
    submitDecision(pendingDecision);
  };

  return (
    <>
      <div className="flex flex-1 flex-col gap-6 xl:flex-row xl:items-start">
        <div className="flex flex-[2] flex-col gap-6 pr-1">
          <section className="rounded-3xl border border-primary/10 bg-primary/5 p-6 shadow-sm">
            <div className="flex flex-col gap-6">
              <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
                    서류 심사 중인 지원자
                  </p>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {applicant.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {applicant.appliedTrack}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {applicant.steps.map((step) => (
                      <span
                        key={step}
                        className="rounded-full bg-white px-4 py-1 text-xs font-semibold text-primary shadow-sm"
                      >
                        {step}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs font-medium text-gray-500">
                    {formatSubmittedAt(applicant.submittedAt)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-6 py-5 text-center shadow-lg">
                  <p className="text-xs font-medium text-gray-500">현재 상태</p>
                  <p
                    className={clsx(
                      "mt-2 rounded-full px-4 py-1 text-sm font-semibold",
                      statusToneMap[applicant.status]
                    )}
                  >
                    {statusLabelMap[applicant.status]}
                  </p>
                </div>
              </header>
              <div className="rounded-2xl bg-white/80 p-4 shadow-inner shadow-primary/10">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {formattedProfile.map((field) => (
                    <div key={field.label} className="flex flex-col gap-1">
                      <span className="text-10 uppercase tracking-wide text-gray-400">
                        {field.label}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {field.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-primary/10 bg-white p-6 shadow-[0_15px_45px_rgba(61,72,255,0.08)]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                작성한 답변
              </h3>
              <span className="text-xs text-gray-500">
                총 {applicant.questions.length}개
              </span>
            </div>
            {applicant.questions.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed border-primary/20 bg-primary/5 px-4 py-6 text-center text-sm text-gray-500">
                작성된 답변이 없습니다.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                {applicant.questions.map((question) => {
                  if (question.type === "paragraph") {
                    return (
                      <article
                        key={question.id}
                        className="rounded-2xl border border-primary/10 bg-white px-5 py-4 shadow-sm"
                      >
                        <h4 className="text-sm font-semibold text-gray-900">
                          {question.question}
                        </h4>
                        <p className="mt-3 whitespace-pre-line rounded-xl bg-primary/5 px-4 py-3 text-sm leading-6 text-gray-700">
                          {question.answer}
                        </p>
                      </article>
                    );
                  }

                  return (
                    <article
                      key={question.id}
                      className="rounded-2xl border border-primary/10 bg-white px-5 py-4 shadow-sm"
                    >
                      <h4 className="text-sm font-semibold text-gray-900">
                        {question.question}
                      </h4>
                      <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                        {question.options.map((option) => {
                          const isChecked = question.selected.includes(option);

                          return (
                            <label
                              key={option}
                              className={clsx(
                                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition",
                                isChecked
                                  ? "bg-white text-gray-900 shadow"
                                  : "text-gray-500"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                readOnly
                                className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                              />
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="flex w-full min-w-[320px] max-w-full flex-col gap-4 xl:w-[320px] xl:flex-shrink-0">
          <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_15px_45px_rgba(61,72,255,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  지원자 상태
                </p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {statusLabelMap[applicant.status]}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              합격/불합격을 확정하면 되돌릴 수 없습니다.
            </p>
            <div className="mt-4 grid gap-2">
              {APPLICANT_STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusButtonClick(status)}
                  disabled={statusButtonsDisabled}
                  className={clsx(
                    "w-full rounded-2xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                    applicant.status === status
                      ? "bg-primary text-white shadow-md"
                      : "border border-gray-200 bg-gray-50 text-gray-600 hover:border-primary/40 hover:text-primary"
                  )}
                >
                  {statusLabelMap[status]}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_15px_45px_rgba(61,72,255,0.08)]">
            <h3 className="text-sm font-semibold text-gray-900">면접 일정</h3>
            <div className="mt-4 space-y-4">
              <div className="rounded-[24px] border border-primary/15 bg-[#F4FFF0] px-4 py-4 shadow-inner shadow-primary/10">
                <div className="flex flex-col gap-1 text-gray-900">
                  <p className="text-xs font-semibold text-primary/80">
                    면접 일시 선택
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setScheduleStep("date")}
                      className={clsx(
                        "flex-1 rounded-2xl border px-3 py-2 text-left text-xs font-semibold transition",
                        scheduleStep === "date"
                          ? "border-primary bg-white text-primary shadow"
                          : "border-transparent bg-primary/10 text-gray-700 hover:border-primary/40"
                      )}
                    >
                      <span className="block text-[10px] uppercase text-gray-500">
                        날짜
                      </span>
                      <span className="text-sm font-bold">
                        {selectedDate ? formatFullDate(selectedDate) : "선택"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => selectedDate && setScheduleStep("time")}
                      disabled={!selectedDate}
                      className={clsx(
                        "flex-1 rounded-2xl border px-3 py-2 text-left text-xs font-semibold transition",
                        scheduleStep === "time"
                          ? "border-primary bg-white text-primary shadow"
                          : "border-transparent bg-primary/10 text-gray-700 hover:border-primary/40",
                        !selectedDate &&
                          "!cursor-not-allowed !bg-gray-100 !text-gray-400"
                      )}
                    >
                      <span className="block text-[10px] uppercase text-gray-500">
                        시간
                      </span>
                      <span className="text-sm font-bold">
                        {selectedTime || "선택"}
                      </span>
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    저장된 일정:{" "}
                    {applicant.interview.rawTime
                      ? `${applicant.interview.date} ${applicant.interview.time}`
                      : "아직 등록되지 않았습니다."}
                  </p>
                </div>
                <div className="mt-4">
                  {scheduleStep === "date" && (
                    <InterviewCalendar
                      currentMonth={currentMonth}
                      days={calendarDays}
                      selectedDate={selectedDate}
                      onSelectDate={(date) => {
                        const normalized = startOfDay(date);
                        setSelectedDate(normalized);
                        setSelectedTime("");
                        setCurrentMonth(startOfMonth(normalized));
                        setScheduleStep("time");
                      }}
                      onPrevMonth={() =>
                        setCurrentMonth(
                          (prev) =>
                            new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                        )
                      }
                      onNextMonth={() =>
                        setCurrentMonth(
                          (prev) =>
                            new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                        )
                      }
                    />
                  )}
                  {scheduleStep === "time" && selectedDate && (
                    <>
                      <InterviewTimePicker
                        selectedTime={selectedTime}
                        onChange={setSelectedTime}
                      />
                      <button
                        type="button"
                        onClick={() => setScheduleStep("date")}
                        className="mt-3 w-full text-xs font-semibold text-primary underline-offset-2 hover:underline"
                      >
                        날짜 다시 선택
                      </button>
                    </>
                  )}
                  {scheduleStep === "time" && !selectedDate && (
                    <p className="rounded-2xl bg-white/80 px-4 py-3 text-center text-xs text-gray-500">
                      날짜를 먼저 선택해주세요.
                    </p>
                  )}
                </div>
              </div>
              <div className="rounded-[24px] border border-gray-100 bg-gray-50 p-4">
                <label
                  className="text-xs text-gray-500"
                  htmlFor="interview-place"
                >
                  면접 장소
                </label>
                <input
                  id="interview-place"
                  type="text"
                  value={interviewPlace}
                  onChange={(event) => setInterviewPlace(event.target.value)}
                  placeholder="면접 장소를 입력해주세요"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
                <p className="mt-2 text-xs text-gray-500">
                  저장된 장소:{" "}
                  {applicant.interview.location?.trim()
                    ? applicant.interview.location
                    : "아직 등록되지 않았습니다."}
                </p>
              </div>
            </div>
            {scheduleError && (
              <p className="mt-3 text-xs text-red-500">{scheduleError}</p>
            )}
            <button
              type="button"
              onClick={handleSaveSchedule}
              disabled={isSavingSchedule}
              className="mt-6 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingSchedule ? "저장 중..." : "저장"}
            </button>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_15px_45px_rgba(61,72,255,0.08)]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">메모</h3>
              <span className="text-xs text-gray-500">
                {memoInput.trim().length}/{MAX_MEMO_LENGTH}
              </span>
            </div>
            <textarea
              value={memoInput}
              onChange={(event) => setMemoInput(event.target.value)}
              maxLength={MAX_MEMO_LENGTH}
              placeholder="메모를 입력해주세요"
              className="mt-3 h-28 w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="button"
              onClick={handleAddMemo}
              disabled={!memoInput.trim() || isAddingMemo}
              className="mt-3 w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white transition enabled:hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              메모 추가
            </button>

            <div className="mt-4 space-y-3">
              {isMemoLoading ? (
                <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                  메모를 불러오는 중입니다.
                </p>
              ) : memoItems.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                  아직 등록된 메모가 없습니다.
                </p>
              ) : (
                memoItems.map((memo) => {
                  const isEditing = memo.id === editingMemoId;
                  return (
                    <div
                      key={memo.id}
                      className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">
                              {memo.author}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatMemoDate(memo.createdAt)}
                            </span>
                          </div>

                          {isEditing ? (
                            <textarea
                              value={editingContent}
                              onChange={(event) =>
                                setEditingContent(event.target.value)
                              }
                              maxLength={MAX_MEMO_LENGTH}
                              className="mt-3 h-24 w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                            />
                          ) : (
                            <p className="mt-3 whitespace-pre-line rounded-xl bg-white px-3 py-2 text-sm leading-6 text-gray-700">
                              {memo.content}
                            </p>
                          )}
                        </div>
                      </div>

                      {memo.isMine && (
                        <div className="mt-3 flex items-center justify-end gap-2 text-xs font-semibold">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="rounded-xl border border-gray-200 px-3 py-1 text-gray-600 transition hover:border-primary/40 hover:text-primary"
                              >
                                취소
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveEdit}
                                disabled={
                                  !editingContent.trim() || isEditingMemo
                                }
                                className="rounded-xl bg-primary px-3 py-1 text-white transition enabled:hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                저장
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleDeleteMemo(memo.id)}
                                disabled={isDeletingMemo}
                                className="rounded-xl border border-gray-200 px-3 py-1 text-gray-500 transition hover:border-red-300 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                삭제
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleStartEdit(memo.id, memo.content)
                                }
                                className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1 text-gray-500 transition hover:border-primary/40 hover:text-primary"
                              >
                                <Pencil className="h-4 w-4" />
                                수정
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </aside>
      </div>
      {isDecisionModalOpen && pendingDecision && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={handleDecisionModalClose}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[360px] rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <p className="text-lg font-semibold text-gray-900">
                {statusLabelMap[pendingDecision]}으로 확정하시겠어요?
              </p>
              <p className="text-sm text-gray-600">
                평가 대기 상태에서 {statusLabelMap[pendingDecision]}을(를)
                선택하면 되돌릴 수 없습니다.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleDecisionModalClose}
                disabled={isSubmittingDecision}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDecision}
                disabled={isSubmittingDecision}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingDecision ? "처리 중..." : "확인"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DetailMainCard;

const getStoredUsername = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const stored =
    localStorage.getItem("username") ??
    localStorage.getItem("managerName") ??
    null;
  return stored;
};

type ManagerIdentity = {
  id: number | null;
  name: string | null;
};

const getCurrentManagerIdentity = (): ManagerIdentity => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken") || localStorage.getItem("token")
        : null;
    if (!token) {
      return { id: null, name: null };
    }
    const decoded = decodeJWT(token);
    if (!decoded) {
      return { id: null, name: null };
    }
    const rawId =
      (decoded.managerId as string | number | undefined) ??
      (decoded.councilManagerId as string | number | undefined) ??
      (decoded.sub as string | number | undefined);
    const numericId =
      typeof rawId === "number"
        ? rawId
        : typeof rawId === "string"
        ? Number(rawId)
        : NaN;
    const id = Number.isFinite(numericId) ? numericId : null;
    const possibleNames = [
      decoded.username,
      decoded.name,
      decoded.managerName,
      decoded.councilManagerName,
      getStoredUsername(),
    ].filter((value): value is string => typeof value === "string");
    const name = possibleNames.find((value) => value.trim().length > 0) ?? null;
    return { id, name };
  } catch (error) {
    console.error("Failed to resolve manager identity", error);
    return { id: null, name: null };
  }
};

const isCommentMine = (
  managerIdentity: ManagerIdentity,
  councilManagerId: number,
  councilManagerName: string
) => {
  const normalize = (value: string | null | undefined) =>
    typeof value === "string" ? value.trim().toLowerCase() : null;
  const storedUsername = getStoredUsername();
  const normalizedCouncilName = normalize(councilManagerName);
  const normalizedManagerName = normalize(managerIdentity.name);
  const normalizedStoredName = normalize(storedUsername);

  const matchedById =
    managerIdentity.id !== null &&
    typeof councilManagerId === "number" &&
    managerIdentity.id === councilManagerId;

  if (IS_DEV) {
    console.debug("[MemoOwnership] id-check", {
      managerId: managerIdentity.id,
      councilManagerId,
      councilManagerName,
      matchedById,
    });
  }

  if (matchedById) {
    return true;
  }

  const matchedByName =
    Boolean(normalizedManagerName) &&
    normalizedManagerName === normalizedCouncilName;
  const matchedByStoredName =
    Boolean(normalizedStoredName) &&
    normalizedStoredName === normalizedCouncilName;

  if (IS_DEV) {
    console.debug("[MemoOwnership] name-check", {
      managerName: managerIdentity.name,
      normalizedManagerName,
      storedUsername,
      normalizedStoredName,
      councilManagerName,
      normalizedCouncilName,
      matchedByName,
      matchedByStoredName,
    });
  }

  if (matchedByName || matchedByStoredName) {
    return true;
  }

  if (IS_DEV) {
    console.debug("[MemoOwnership] no-match", {
      managerIdentity,
      councilManagerId,
      councilManagerName,
    });
  }
  return false;
};

const formatDisplayDate = (iso?: string) => {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
};

const formatDisplayTime = (iso?: string) => {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHour = hours % 12 || 12;
  return `${suffix} ${String(normalizedHour).padStart(2, "0")}:${minutes}`;
};

const formatFullDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const parseInterviewDate = (iso?: string) => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return startOfDay(date);
};

const toTimeValue = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
};

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (a: Date | null, b: Date | null) => {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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

const mergeDateAndTime = (date: Date, time: string) => {
  const [hours = "0", minutes = "0"] = time.split(":");
  const parsedHours = Number.parseInt(hours, 10);
  const parsedMinutes = Number.parseInt(minutes, 10);
  if (Number.isNaN(parsedHours) || Number.isNaN(parsedMinutes)) {
    return null;
  }
  const merged = new Date(date);
  merged.setHours(parsedHours, parsedMinutes, 0, 0);
  return merged;
};

const isValidTimeValue = (value: string) =>
  /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

const extractApiErrorMessage = (error: unknown): string | null => {
  if (!isAxiosError(error)) {
    return null;
  }

  const axiosError = error as {
    response?: {
      data?: unknown;
    };
  };
  const data = axiosError.response?.data;
  if (!data) {
    return null;
  }

  if (typeof data === "string") {
    return data;
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message?: unknown }).message === "string"
  ) {
    return (data as { message: string }).message;
  }

  return null;
};

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, "0")
);
const MINUTE_OPTIONS = ["00", "30"];

type InterviewCalendarProps = {
  currentMonth: Date;
  days: Date[];
  selectedDate: Date | null;
  onSelectDate: (value: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

const InterviewCalendar = ({
  currentMonth,
  days,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: InterviewCalendarProps) => {
  return (
    <div className="rounded-[24px] border border-primary/20 bg-white/80 px-4 py-3 shadow-inner shadow-primary/10">
      <div className="flex items-center justify-between text-primary">
        <button
          type="button"
          onClick={onPrevMonth}
          className="rounded-full p-2 transition hover:bg-primary/10"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex flex-col items-center gap-1 text-gray-900">
          <span className="text-sm font-semibold">
            {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
          </span>
          <span className="text-xs text-primary">날짜를 먼저 선택하세요</span>
        </div>
        <button
          type="button"
          onClick={onNextMonth}
          className="rounded-full p-2 transition hover:bg-primary/10"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-primary">
        {DAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {days.map((date) => {
          const isCurrentMonth =
            date.getMonth() === currentMonth.getMonth() &&
            date.getFullYear() === currentMonth.getFullYear();
          const isSelected = isSameDay(date, selectedDate);
          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelectDate(date)}
              className={clsx(
                "flex h-9 w-full items-center justify-center rounded-full text-sm transition",
                isSelected
                  ? "bg-primary text-white font-semibold shadow"
                  : isCurrentMonth
                  ? "text-gray-800 hover:bg-primary/10"
                  : "text-gray-300"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

type InterviewTimePickerProps = {
  selectedTime: string;
  onChange: (value: string) => void;
};

const InterviewTimePicker = ({
  selectedTime,
  onChange,
}: InterviewTimePickerProps) => {
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);
  const [rawHour = "00", rawMinute = "00"] = selectedTime.split(":");
  const selectedHour = rawHour.padStart(2, "0");
  const selectedMinute = rawMinute.padStart(2, "0");

  const handleHourClick = (hour: string) => {
    onChange(`${hour}:${selectedMinute}`);
  };

  const handleMinuteClick = (minute: string) => {
    onChange(`${selectedHour}:${minute}`);
  };

  useEffect(() => {
    const scrollToSelected = (
      container: HTMLDivElement | null,
      value: string
    ) => {
      if (!container) return;
      const target = container.querySelector<HTMLButtonElement>(
        `[data-value="${value}"]`
      );
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
    };

    scrollToSelected(hourListRef.current, selectedHour);
    scrollToSelected(minuteListRef.current, selectedMinute);
  }, [selectedHour, selectedMinute]);

  const pickerButtonClass = (isActive: boolean) =>
    clsx(
      "w-full rounded-2xl px-3 py-2 text-center text-sm transition",
      isActive
        ? "bg-primary text-white shadow"
        : "bg-white text-gray-700 hover:bg-primary/10 hover:text-primary"
    );

  return (
    <div className="relative rounded-[24px] border border-primary/20 bg-white/80 px-4 py-3 shadow-inner shadow-primary/10">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">시간 선택</span>
        <span className="text-sm font-semibold text-primary">
          {`${selectedHour}:${selectedMinute}`}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-gray-500">
        날짜 선택 후 시간을 지정할 수 있어요.
      </p>
      <div className="mt-3 flex gap-3">
        <div className="flex-1">
          <p className="text-xs text-gray-500">시간</p>
          <div
            ref={hourListRef}
            className="mt-2 max-h-48 space-y-2 overflow-y-auto pr-1"
          >
            {HOUR_OPTIONS.map((hour) => (
              <button
                key={hour}
                type="button"
                data-value={hour}
                onClick={() => handleHourClick(hour)}
                className={pickerButtonClass(hour === selectedHour)}
              >
                {hour}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500">분</p>
          <div
            ref={minuteListRef}
            className="mt-2 max-h-48 space-y-2 overflow-y-auto pr-1"
          >
            {MINUTE_OPTIONS.map((minute) => (
              <button
                key={minute}
                type="button"
                data-value={minute}
                onClick={() => handleMinuteClick(minute)}
                className={pickerButtonClass(minute === selectedMinute)}
              >
                {minute}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
