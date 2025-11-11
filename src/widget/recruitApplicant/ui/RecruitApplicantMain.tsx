import { useEffect, useState } from "react";
import DetailMainCard from "@/widget/recruitdetail/components/DetailMainCard";
import InterviewDetailCard from "@/widget/recruitdetail/components/InterviewDetailCard";
import type {
  ApplicantDetail,
  ApplicantStatus,
} from "@/widget/recruitdetail/types";

interface RecruitApplicantMainProps {
  initialApplicant: ApplicantDetail | null;
  applicationId: number;
  viewMode?: "document" | "interview";
}

const RecruitApplicantMain = ({
  initialApplicant,
  applicationId,
  viewMode = "document",
}: RecruitApplicantMainProps) => {
  const [applicant, setApplicant] = useState<ApplicantDetail | null>(
    initialApplicant
  );
  const [currentView, setCurrentView] =
    useState<"document" | "interview">(viewMode);

  useEffect(() => {
    setApplicant(initialApplicant);
  }, [initialApplicant]);

  useEffect(() => {
    setCurrentView(viewMode);
  }, [viewMode]);

  const handleStatusChange = (
    applicantId: string,
    status: ApplicantStatus,
    evaluationStatus?: string
  ) => {
    setApplicant((prev) => {
      if (!prev || prev.id !== applicantId) {
        return prev;
      }
      return {
        ...prev,
        status,
        evaluationStatus: evaluationStatus ?? prev.evaluationStatus,
      };
    });
  };

  const handleInterviewResultChange = (
    applicantId: string,
    evaluationStatus: "PASSED" | "FAILED",
    status: ApplicantStatus
  ) => {
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
