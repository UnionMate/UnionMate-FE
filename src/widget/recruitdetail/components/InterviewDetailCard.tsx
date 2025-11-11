import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApplicantDetail, ApplicantStatus } from "../types";
import {
  createApplicationEvaluation,
  deleteApplicationEvaluation,
  getApplicationEvaluations,
  updateApplicationEvaluation,
  updateInterviewDecision,
  type ApplicationEvaluation,
} from "@/api/application";
import { decodeJWT } from "@/lib/utils";

interface InterviewDetailCardProps {
  applicant: ApplicantDetail;
  applicationId: number;
  onResultChange: (
    applicantId: string,
    evaluationStatus: "PASSED" | "FAILED",
    status: ApplicantStatus
  ) => void;
}

const MAX_EVALUATION_LENGTH = 1000;

const InterviewDetailCard = ({
  applicant,
  applicationId,
  onResultChange,
}: InterviewDetailCardProps) => {
  const queryClient = useQueryClient();
  const managerIdentity = useMemo(() => getCurrentManagerIdentity(), []);
  const [editorValue, setEditorValue] = useState("");
  const [decision, setDecision] = useState<"pass" | "fail">(
    applicant.evaluationStatus === "FAILED" ? "fail" : "pass"
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  useEffect(() => {
    setDecision(applicant.evaluationStatus === "FAILED" ? "fail" : "pass");
  }, [applicant.evaluationStatus]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["application-evaluations", applicationId],
    queryFn: () => getApplicationEvaluations(applicationId),
    enabled: Number.isFinite(applicationId),
    staleTime: 1000 * 30,
  });

  const evaluations = data?.data ?? [];

  const invalidateEvaluations = () => {
    queryClient.invalidateQueries({
      queryKey: ["application-evaluations", applicationId],
    });
  };

  const { mutate: addEvaluation, isPending: isAdding } = useMutation({
    mutationFn: (evaluation: string) =>
      createApplicationEvaluation(applicationId, { evaluation }),
    onSuccess: () => {
      toast.success("면접 내용이 기록되었습니다.");
      setEditorValue("");
      invalidateEvaluations();
    },
    onError: () => {
      toast.error("면접 내용을 저장하지 못했습니다.");
    },
  });

  const { mutate: editEvaluation, isPending: isEditing } = useMutation({
    mutationFn: ({
      evaluationId,
      evaluation,
    }: {
      evaluationId: number;
      evaluation: string;
    }) =>
      updateApplicationEvaluation(applicationId, evaluationId, {
        evaluation,
      }),
    onSuccess: () => {
      toast.success("면접 내용이 수정되었습니다.");
      setEditingId(null);
      setEditingValue("");
      invalidateEvaluations();
    },
    onError: () => toast.error("면접 내용을 수정하지 못했습니다."),
  });

  const { mutate: removeEvaluation, isPending: isDeleting } = useMutation({
    mutationFn: (evaluationId: number) =>
      deleteApplicationEvaluation(applicationId, evaluationId),
    onSuccess: () => {
      toast.success("면접 내용이 삭제되었습니다.");
      invalidateEvaluations();
    },
    onError: () => toast.error("면접 내용을 삭제하지 못했습니다."),
  });

  const { mutate: saveDecision, isPending: isSavingDecision } = useMutation({
    mutationFn: (status: "PASSED" | "FAILED") =>
      updateInterviewDecision(applicationId, { status }),
    onSuccess: (_, status) => {
      toast.success("면접 평가 결과가 저장되었습니다.");
      onResultChange(
        applicant.id,
        status,
        status === "PASSED" ? "pass" : "fail"
      );
    },
    onError: () => {
      toast.error("면접 평가 결과를 저장하지 못했습니다.");
    },
  });

  const handleCreateEvaluation = () => {
    const trimmed = editorValue.trim();
    if (!trimmed) return;
    addEvaluation(trimmed);
  };

  const handleEditEvaluation = () => {
    if (!editingId) return;
    const trimmed = editingValue.trim();
    if (!trimmed) return;
    editEvaluation({ evaluationId: editingId, evaluation: trimmed });
  };

  const decisionStatus = decision === "pass" ? "PASSED" : "FAILED";

  return (
    <div className="flex flex-1 flex-col gap-6 xl:flex-row xl:items-start">
      <div className="flex flex-[2] flex-col gap-6 pr-1">
        <InterviewInfoCard applicant={applicant} />
        <section className="rounded-3xl border border-primary/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-title-16-semibold text-gray-900">
                면접 내용 기록
              </p>
              <p className="text-13-regular text-gray-500">
                한 명 당 하나만 생성할 수 있어요.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>텍스트</span>
              <span>볼드</span>
              <span>밑줄</span>
            </div>
          </div>
          <textarea
            value={editorValue}
            onChange={(event) => setEditorValue(event.target.value)}
            maxLength={MAX_EVALUATION_LENGTH}
            placeholder="면접 내용을 입력해주세요."
            className="mt-4 h-40 w-full rounded-2xl border border-black-15 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={handleCreateEvaluation}
            disabled={!editorValue.trim() || isAdding}
            className="mt-4 w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAdding ? "저장 중..." : "저장하기"}
          </button>
        </section>

        <section className="rounded-3xl border border-primary/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              면접 내용 기록
            </h3>
            <span className="text-13-regular text-gray-500">
              총 {evaluations.length}건
            </span>
          </div>
          <div className="mt-4 space-y-4">
            {isLoading ? (
              <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                면접 내용을 불러오는 중입니다.
              </p>
            ) : isError ? (
              <p className="rounded-2xl border border-dashed border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-500">
                면접 내용을 불러오지 못했습니다.
              </p>
            ) : evaluations.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                아직 등록된 면접 기록이 없습니다.
              </p>
            ) : (
              evaluations.map((evaluation) => (
                <InterviewEvaluationCard
                  key={evaluation.evaluationId}
                  evaluation={evaluation}
                  canEdit={
                    managerIdentity?.id !== null &&
                    managerIdentity.id === evaluation.councilManagerId
                  }
                  isEditing={editingId === evaluation.evaluationId}
                  editingValue={editingValue}
                  onEditStart={() => {
                    setEditingId(evaluation.evaluationId);
                    setEditingValue(evaluation.evaluation);
                  }}
                  onEditCancel={() => {
                    setEditingId(null);
                    setEditingValue("");
                  }}
                  onDelete={() => removeEvaluation(evaluation.evaluationId)}
                  onEditingChange={(value) => setEditingValue(value)}
                  onSaveEdit={handleEditEvaluation}
                  isSaving={isEditing}
                  isDeleting={isDeleting}
                />
              ))
            )}
          </div>
        </section>
      </div>

      <aside className="flex w-full min-w-[320px] max-w-full flex-col gap-4 xl:w-[320px] xl:flex-shrink-0">
        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow">
          <h3 className="text-sm font-semibold text-gray-900">면접 평가 결과</h3>
          <p className="mt-1 text-xs text-gray-500">
            합격을 선택하면 면접 합격(PASSED), 불합격은 FAILED로 저장됩니다.
          </p>
          <div className="mt-4 grid gap-2">
            {(["pass", "fail"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setDecision(value)}
                className={clsx(
                  "w-full rounded-2xl px-4 py-2 text-sm font-semibold transition",
                  decision === value
                    ? "bg-primary text-white shadow"
                    : "border border-gray-200 bg-gray-50 text-gray-600 hover:border-primary/40 hover:text-primary"
                )}
              >
                {value === "pass" ? "합격" : "불합격"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => saveDecision(decisionStatus)}
            disabled={isSavingDecision}
            className="mt-4 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingDecision ? "저장 중..." : "저장하기"}
          </button>
        </section>
      </aside>
    </div>
  );
};

const InterviewInfoCard = ({ applicant }: { applicant: ApplicantDetail }) => {
  return (
    <section className="rounded-3xl border border-primary/10 bg-primary/5 p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
            면접 평가 중인 지원자
          </p>
          <div>
            <p className="text-2xl font-bold text-gray-900">{applicant.name}</p>
            <p className="text-sm text-gray-500">{applicant.appliedTrack}</p>
          </div>
          <div className="grid gap-4 rounded-2xl bg-white/80 p-4 shadow-inner shadow-primary/10 md:grid-cols-2 xl:grid-cols-3">
            {applicant.profile.map((field) => (
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
          <p className="text-xs font-medium text-gray-500">면접 일정</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {applicant.interview.date} {applicant.interview.time}
          </p>
          <p className="text-xs text-gray-500">{applicant.interview.location}</p>
        </div>
      </div>
    </section>
  );
};

const InterviewEvaluationCard = ({
  evaluation,
  canEdit,
  isEditing,
  editingValue,
  onEditStart,
  onEditCancel,
  onEditingChange,
  onSaveEdit,
  onDelete,
  isSaving,
  isDeleting,
}: {
  evaluation: ApplicationEvaluation;
  canEdit: boolean;
  isEditing: boolean;
  editingValue: string;
  onEditStart: () => void;
  onEditCancel: () => void;
  onEditingChange: (value: string) => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  isSaving: boolean;
  isDeleting: boolean;
}) => {
  const displayDate = formatDateTime(
    evaluation.updatedAt ?? evaluation.createdAt
  );

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {evaluation.councilManagerName}
          </p>
          <p className="text-xs text-gray-500">{displayDate}</p>
        </div>
        {canEdit && !isEditing && (
          <div className="flex gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={onEditStart}
              className="rounded-xl border border-gray-200 px-3 py-1 text-gray-600 transition hover:border-primary/40 hover:text-primary"
            >
              수정
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="rounded-xl border border-red-200 px-3 py-1 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              삭제
            </button>
          </div>
        )}
      </div>
      {isEditing ? (
        <div className="mt-3 space-y-3">
          <textarea
            value={editingValue}
            onChange={(event) => onEditingChange(event.target.value)}
            maxLength={MAX_EVALUATION_LENGTH}
            className="h-32 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex justify-end gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={onEditCancel}
              className="rounded-xl border border-gray-200 px-3 py-1 text-gray-600 transition hover:border-primary/40 hover:text-primary"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onSaveEdit}
              disabled={!editingValue.trim() || isSaving}
              className="rounded-xl bg-primary px-3 py-1 text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-3 whitespace-pre-line rounded-xl bg-white px-3 py-2 text-sm leading-6 text-gray-700">
          {evaluation.evaluation}
        </p>
      )}
    </div>
  );
};

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

type ManagerIdentity = {
  id: number | null;
};

const getCurrentManagerIdentity = (): ManagerIdentity => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken") || localStorage.getItem("token")
        : null;
    if (!token) {
      return { id: null };
    }
    const decoded = decodeJWT(token);
    if (!decoded) {
      return { id: null };
    }
    const rawId =
      (decoded.managerId as number | string | undefined) ??
      (decoded.councilManagerId as number | string | undefined) ??
      (decoded.sub as number | string | undefined);
    const numericId =
      typeof rawId === "number"
        ? rawId
        : typeof rawId === "string"
          ? Number(rawId)
          : NaN;
    const id = Number.isFinite(numericId) ? numericId : null;
    return { id };
  } catch (error) {
    console.error("Failed to resolve manager identity", error);
    return { id: null };
  }
};

export default InterviewDetailCard;
