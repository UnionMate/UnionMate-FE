import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import RecruitApplicantMain from "@/widget/recruitApplicant/ui/RecruitApplicantMain";
import { getApplicationAdminDetail } from "@/api/application";
import { mapAdminApplicationDetailToApplicant } from "@/lib/applications/mapAdminApplicationDetail";
import type { ApplicantDetail } from "@/widget/recruitdetail/types";

interface ApplicantLocationState {
  applicantInfo?: {
    name: string;
    email: string;
    tel?: string;
    appliedAt?: string;
    evaluationStatus?: string;
  };
  applicant?: ApplicantDetail;
}

const RecruitApplicantPage = () => {
  const { applicantId } = useParams<{
    id: string;
    applicantId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();

  const parsedApplicationId = applicantId ? Number(applicantId) : NaN;
  const hasValidApplicationId = Number.isFinite(parsedApplicationId);

  const state = location.state as ApplicantLocationState | null;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["application-admin-detail", parsedApplicationId],
    queryFn: () => getApplicationAdminDetail(parsedApplicationId),
    enabled: hasValidApplicationId,
  });

  const applicant = useMemo<ApplicantDetail | null>(() => {
    if (state?.applicant && state.applicant.id === applicantId) {
      return state.applicant;
    }
    if (!data?.data) {
      return null;
    }
    return mapAdminApplicationDetailToApplicant(data.data);
  }, [applicantId, data?.data, state]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const renderContent = () => {
    if (!hasValidApplicationId) {
      return (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-sm text-gray-500">
          유효한 지원서 정보를 확인할 수 없습니다.
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-gray-100 bg-white text-sm text-gray-500">
          지원서 정보를 불러오는 중입니다...
        </div>
      );
    }

    if (isError || !applicant) {
      const message =
        error instanceof Error
          ? error.message
          : "지원서를 불러오지 못했습니다. 다시 시도해주세요.";
      return (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-red-200 bg-white text-sm text-red-500">
          {message}
        </div>
      );
    }

    return (
      <RecruitApplicantMain
        initialApplicant={applicant}
        applicationId={parsedApplicationId}
      />
    );
  };

  return (
    <div className="flex h-full w-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="flex flex-col gap-6 px-0 py-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGoBack}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-primary/40 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              돌아가기
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-0 pb-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default RecruitApplicantPage;
