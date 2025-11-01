import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Pencil } from "lucide-react";
import type { ApplicantDetail, ApplicantStatus } from "../types";
import {
  APPLICANT_STATUS_OPTIONS,
  statusLabelMap,
  statusToneMap,
} from "../constants/applicants";

interface DetailMainCardProps {
  applicant: ApplicantDetail;
  onAddMemo: (applicantId: string, content: string) => void;
  onUpdateMemo: (applicantId: string, memoId: string, content: string) => void;
  onDeleteMemo: (applicantId: string, memoId: string) => void;
  onStatusChange: (applicantId: string, status: ApplicantStatus) => void;
}

const MAX_MEMO_LENGTH = 250;

const DetailMainCard = ({
  applicant,
  onAddMemo,
  onUpdateMemo,
  onDeleteMemo,
  onStatusChange,
}: DetailMainCardProps) => {
  const [memoInput, setMemoInput] = useState("");
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  useEffect(() => {
    setMemoInput("");
    setEditingMemoId(null);
    setEditingContent("");
  }, [applicant.id]);

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

  return (
    <div className="flex flex-1 flex-col gap-6 xl:flex-row xl:items-start">
      <div className="flex flex-[2] flex-col gap-6 pr-1">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {applicant.steps.map((step) => (
                  <span
                    key={step}
                    className="rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold text-primary"
                  >
                    {step}
                  </span>
                ))}
              </div>
              <p className="text-xs font-medium text-gray-500">
                {formatSubmittedAt(applicant.submittedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">
                현재 상태
              </span>
              <span
                className={clsx(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  statusToneMap[applicant.status]
                )}
              >
                {statusLabelMap[applicant.status]}
              </span>
            </div>
          </header>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {formattedProfile.map((field) => (
              <div key={field.label} className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500">
                  {field.label}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {applicant.questions.map((question) => {
          if (question.type === "paragraph") {
            return (
              <section
                key={question.id}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <h3 className="text-base font-semibold text-gray-900">
                  {question.question}
                </h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">
                  {question.answer}
                </p>
              </section>
            );
          }

          return (
            <section
              key={question.id}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <h3 className="text-base font-semibold text-gray-900">
                {question.question}
              </h3>
              <div className="mt-4 space-y-2">
                {question.options.map((option) => {
                  const isChecked = question.selected.includes(option);

                  return (
                    <label
                      key={option}
                      className={clsx(
                        "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition",
                        isChecked
                          ? "border-primary/50 bg-primary/5 text-gray-900"
                          : "border-gray-200 text-gray-500"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="h-4 w-4 rounded"
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
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">지원자 상태</h3>
          <p className="mt-1 text-xs text-gray-500">
            합격 여부를 선택하면 리스트에도 바로 반영됩니다.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {APPLICANT_STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => onStatusChange(applicant.id, status)}
                className={clsx(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  applicant.status === status
                    ? "bg-primary text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:text-primary"
                )}
              >
                {statusLabelMap[status]}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">응원 평가</h3>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-primary/5 px-3 py-4">
              <span className="text-2xl">👍</span>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {applicant.reactions.cheer}
              </p>
              <p className="text-xs text-gray-500">응원해요</p>
            </div>
            <div className="rounded-xl bg-primary/5 px-3 py-4">
              <span className="text-2xl">😍</span>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {applicant.reactions.impressed}
              </p>
              <p className="text-xs text-gray-500">잘했어요</p>
            </div>
            <div className="rounded-xl bg-primary/5 px-3 py-4">
              <span className="text-2xl">🤔</span>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {applicant.reactions.curious}
              </p>
              <p className="text-xs text-gray-500">더 궁금해요</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">메모</h3>
          <textarea
            value={memoInput}
            onChange={(event) => setMemoInput(event.target.value)}
            maxLength={MAX_MEMO_LENGTH}
            placeholder="메모를 입력해주세요"
            className="mt-3 h-24 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>
              {memoInput.trim().length}/{MAX_MEMO_LENGTH}
            </span>
            <button
              type="button"
              onClick={handleAddMemo}
              disabled={!memoInput.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              메모 추가
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {applicant.memos.length === 0 && (
              <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-500">
                아직 등록된 메모가 없습니다. 상단에서 메모를 추가해보세요.
              </p>
            )}
            {applicant.memos.map((memo) => {
              const isEditing = memo.id === editingMemoId;
              return (
                <div
                  key={memo.id}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4"
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
                          className="mt-3 h-24 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                        />
                      ) : (
                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">
                          {memo.content}
                        </p>
                      )}
                    </div>
                  </div>

                  {memo.isMine && (
                    <div className="mt-3 flex items-center justify-end gap-2 text-xs">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="rounded-lg border border-gray-200 px-3 py-1 font-medium text-gray-600 transition hover:border-primary/40 hover:text-primary"
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            disabled={!editingContent.trim()}
                            className="rounded-lg bg-primary px-3 py-1 font-semibold text-white transition enabled:hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            저장
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => onDeleteMemo(applicant.id, memo.id)}
                            className="rounded-lg border border-gray-200 px-3 py-1 font-medium text-gray-600 transition hover:border-red-300 hover:text-red-500"
                          >
                            삭제
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleStartEdit(memo.id, memo.content)
                            }
                            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1 font-medium text-gray-600 transition hover:border-primary/40 hover:text-primary"
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
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">면접 일정</h3>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs text-gray-500">면접 일시</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {applicant.interview.date}
                </span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {applicant.interview.time}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">면접 장소</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
                {applicant.interview.location}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            저장
          </button>
        </section>
      </aside>
    </div>
  );
};

export default DetailMainCard;
