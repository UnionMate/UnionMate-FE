import { useEffect, useMemo, useState } from "react";
import DetailMainCard from "@/widget/recruitdetail/components/DetailMainCard";
import InterviewDetailCard from "@/widget/recruitdetail/components/InterviewDetailCard";
import type {
  ApplicantDetail,
  ApplicantStatus,
} from "@/widget/recruitdetail/types";
import { useApplicantStageStore } from "@/shared/stores/useApplicantStageStore";

interface RecruitApplicantMainProps {
  initialApplicant: ApplicantDetail | null;
  applicationId: number;
  viewMode?: "document" | "interview";
  stageKey?: string | null;
  onInvalidateLists?: () => void;
}

const RecruitApplicantMain = ({
  initialApplicant,
  applicationId,
  viewMode = "document",
  stageKey,
  onInvalidateLists,
}: RecruitApplicantMainProps) => {
  const [applicant, setApplicant] = useState<ApplicantDetail | null>(
    initialApplicant
  );
  const [currentView, setCurrentView] = useState<"document" | "interview">(
    viewMode
  );

  const stages = useApplicantStageStore((state) => state.stages);
  const setStage = useApplicantStageStore((state) => state.setStage);

  useEffect(() => {
    setApplicant(initialApplicant);
  }, [initialApplicant]);

  useEffect(() => {
    setCurrentView(viewMode);
  }, [viewMode]);

  const stage = useMemo(
    () => (stageKey ? stages[stageKey] : undefined),
    [stageKey, stages]
  );

  const handleStatusChange = (
    applicantId: string,
    status: ApplicantStatus,
    nextEvaluationStatus?: string,
    nextRecruitmentStatus?: string
  ) => {
    const resolvedEvaluationStatus =
      nextEvaluationStatus ??
      (status === "pass"
        ? stage?.recruitmentStatus === "FINAL"
          ? "PASSED"
          : "SUBMITTED"
        : status === "fail"
        ? "FAILED"
        : stage?.evaluationStatus ?? "SUBMITTED");
    const resolvedRecruitmentStatus =
      nextRecruitmentStatus ??
      (status === "pass"
        ? stage?.recruitmentStatus === "FINAL"
          ? "FINAL"
          : "INTERVIEW"
        : status === "fail"
        ? stage?.recruitmentStatus === "FINAL"
          ? "FINAL"
          : "DOCUMENT_SCREENING"
        : stage?.recruitmentStatus ?? "DOCUMENT_SCREENING");

    if (stageKey) {
      setStage(stageKey, {
        status,
        evaluationStatus: resolvedEvaluationStatus,
        recruitmentStatus: resolvedRecruitmentStatus,
      });
    }

    setApplicant((prev) => {
      if (!prev || prev.id !== applicantId) {
        return prev;
      }
      return {
        ...prev,
        status,
        evaluationStatus: resolvedEvaluationStatus,
      };
    });

    onInvalidateLists?.();
  };

  const handleInterviewResultChange = (
    applicantId: string,
    evaluationStatus: "PASSED" | "FAILED",
    status: ApplicantStatus
  ) => {
    if (stageKey) {
      setStage(stageKey, {
        status,
        evaluationStatus,
        recruitmentStatus: "FINAL",
      });
    }

    setApplicant((prev) => {
      if (!prev || prev.id !== applicantId) {
        return prev;
      }
      return {
        ...prev,
        status,
        evaluationStatus,
      };
    });

    onInvalidateLists?.();
  };

  const handleInterviewUpdate = (
    applicantId: string,
    interview: ApplicantDetail["interview"]
  ) => {
    setApplicant((prev) => {
      if (!prev || prev.id !== applicantId) {
        return prev;
      }
      return {
        ...prev,
        interview,
      };
    });
  };

  if (!applicant) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-sm text-gray-500">
        선택한 지원자를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {currentView === "interview" ? (
        <InterviewDetailCard
          applicant={applicant}
          applicationId={applicationId}
          onResultChange={handleInterviewResultChange}
        />
      ) : (
        <DetailMainCard
          applicant={applicant}
          applicationId={applicationId}
          onStatusChange={handleStatusChange}
          onInterviewUpdate={handleInterviewUpdate}
        />
      )}
    </div>
  );
};

export default RecruitApplicantMain;
