import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Pencil } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApplicantDetail, ApplicantStatus } from "../types";
import {
  APPLICANT_STATUS_OPTIONS,
  statusLabelMap,
  statusToneMap,
} from "../constants/applicants";
import {
  updateInterviewSchedule,
  type UpdateInterviewScheduleRequest,
} from "@/api/application";

interface DetailMainCardProps {
  applicant: ApplicantDetail;
  onAddMemo: (applicantId: string, content: string) => void;
  onUpdateMemo: (applicantId: string, memoId: string, content: string) => void;
  onDeleteMemo: (applicantId: string, memoId: string) => void;
  onStatusChange: (applicantId: string, status: ApplicantStatus) => void;
  onInterviewUpdate: (
    applicantId: string,
    interview: ApplicantDetail["interview"]
  ) => void;
  isMemoLoading?: boolean;
}

const MAX_MEMO_LENGTH = 250;

const DetailMainCard = ({
  applicant,
  onAddMemo,
  onUpdateMemo,
  onDeleteMemo,
  onStatusChange,
  onInterviewUpdate,
  isMemoLoading = false,
}: DetailMainCardProps) => {
  const [memoInput, setMemoInput] = useState("");
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [interviewTimeValue, setInterviewTimeValue] = useState(() =>
    toInputValue(applicant.interview.rawTime)
  );
  const [interviewPlace, setInterviewPlace] = useState(
    applicant.interview.location ?? ""
  );
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const { mutate: saveInterviewSchedule, isPending: isSavingSchedule } =
    useMutation({
      mutationFn: (payload: UpdateInterviewScheduleRequest) =>
        updateInterviewSchedule(Number(applicant.id), payload),
    });

  useEffect(() => {
    setMemoInput("");
    setEditingMemoId(null);
    setEditingContent("");
    setInterviewTimeValue(toInputValue(applicant.interview.rawTime));
    setInterviewPlace(applicant.interview.location ?? "");
    setScheduleError(null);
  }, [applicant.id, applicant.interview.location, applicant.interview.rawTime]);

  useEffect(() => {
    if (!editingMemoId) {
      return;
    }

    const stillExists = applicant.memos.some(
      (memo) => memo.id === editingMemoId
    );

    if (!stillExists) {
      setEditingMemoId(null);
      setEditingContent("");
    }
  }, [applicant.memos, editingMemoId]);

  const handleAddMemo = () => {
    const trimmed = memoInput.trim();
    if (!trimmed) return;
    onAddMemo(applicant.id, trimmed);
    setMemoInput("");
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
    onUpdateMemo(applicant.id, editingMemoId, trimmed);
    setEditingMemoId(null);
    setEditingContent("");
  };

  const formattedProfile = useMemo(
    () => applicant.profile,
    [applicant.profile]
  );

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
    if (!interviewTimeValue || !interviewPlace.trim()) {
      setScheduleError("면접 일시와 장소를 모두 입력해주세요.");
      return;
    }

    const isoTime = new Date(interviewTimeValue).toISOString();
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

  return (
    <div className="flex flex-1 flex-col gap-6 xl:flex-row xl:items-start">
      <div className="flex flex-[2] flex-col gap-6 pr-1">
        <section className="rounded-3xl border border-primary/10 bg-primary/5 p-6 shadow-sm">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
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
              <div className="grid gap-4 rounded-2xl bg-white/70 p-4 shadow-inner md:grid-cols-2 xl:grid-cols-3">
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
            <div className="rounded-2xl bg-white px-4 py-3 text-center shadow">
              <p className="text-xs font-medium text-gray-500">현재 상태</p>
              <p
                className={clsx(
                  "mt-1 rounded-full px-3 py-1 text-sm font-semibold",
                  statusToneMap[applicant.status]
                )}
              >
                {statusLabelMap[applicant.status]}
              </p>
            </div>
          </header>
        </section>

        {applicant.questions.map((question) => {
          if (question.type === "paragraph") {
            return (
              <section
                key={question.id}
                className="rounded-3xl border border-primary/10 bg-white p-6 shadow-[0_15px_45px_rgba(61,72,255,0.08)]"
              >
                <h3 className="text-base font-semibold text-gray-900">
                  {question.question}
                </h3>
                <p className="mt-4 whitespace-pre-line rounded-2xl bg-primary/5 px-5 py-4 text-sm leading-6 text-gray-700">
                  {question.answer}
                </p>
              </section>
            );
          }

          return (
            <section
              key={question.id}
              className="rounded-3xl border border-primary/10 bg-white p-6 shadow-[0_15px_45px_rgba(61,72,255,0.08)]"
            >
              <h3 className="text-base font-semibold text-gray-900">
                {question.question}
              </h3>
              <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
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
            </section>
          );
        })}
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
            <span
              className={clsx(
                "rounded-full px-3 py-1 text-xs font-semibold",
                statusToneMap[applicant.status]
              )}
            >
              {statusLabelMap[applicant.status]}
            </span>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            상태를 변경하면 목록에도 즉시 반영돼요.
          </p>
          <div className="mt-4 grid gap-2">
            {APPLICANT_STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => onStatusChange(applicant.id, status)}
                className={clsx(
                  "w-full rounded-2xl px-4 py-2 text-sm font-semibold transition",
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
            disabled={!memoInput.trim()}
            className="mt-3 w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white transition enabled:hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            메모 추가
          </button>

          <div className="mt-4 space-y-3">
            {isMemoLoading ? (
              <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                메모를 불러오는 중입니다.
              </p>
            ) : applicant.memos.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                아직 등록된 메모가 없습니다.
              </p>
            ) : (
              applicant.memos.map((memo) => {
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
                              disabled={!editingContent.trim()}
                              className="rounded-xl bg-primary px-3 py-1 text-white transition enabled:hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              저장
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                onDeleteMemo(applicant.id, memo.id)
                              }
                              className="rounded-xl border border-gray-200 px-3 py-1 text-gray-500 transition hover:border-red-300 hover:text-red-500"
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

        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_15px_45px_rgba(61,72,255,0.08)]">
          <h3 className="text-sm font-semibold text-gray-900">면접 일정</h3>
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl bg-primary/5 p-4">
              <label className="text-xs text-gray-500" htmlFor="interview-time">
                면접 일시
              </label>
              <input
                id="interview-time"
                type="datetime-local"
                value={interviewTimeValue}
                onChange={(event) => setInterviewTimeValue(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>현재 저장된 일정</span>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-primary shadow">
                  {applicant.interview.date || "-"}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-primary shadow">
                  {applicant.interview.time || "-"}
                </span>
              </div>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">면접 장소</p>
              <textarea
                value={interviewPlace}
                onChange={(event) => setInterviewPlace(event.target.value)}
                placeholder="면접 장소를 입력해주세요"
                className="mt-2 h-20 w-full resize-none rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
                {applicant.interview.location || "등록된 장소가 없습니다."}
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
      </aside>
    </div>
  );
};

export default DetailMainCard;

const toInputValue = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 16);
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
