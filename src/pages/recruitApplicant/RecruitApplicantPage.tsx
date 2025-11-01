import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import RecruitApplicantMain from "@/widget/recruitApplicant/ui/RecruitApplicantMain";
import {
  REVIEWER_DISPLAY_NAME,
  findApplicantById,
} from "@/widget/recruitdetail/constants/applicants";
import type { ApplicantDetail } from "@/widget/recruitdetail/types";

interface ApplicantLocationState {
  applicant?: ApplicantDetail;
}

const RecruitApplicantPage = () => {
  const { applicantId } = useParams<{
    id: string;
    applicantId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();

  const initialApplicant = useMemo(() => {
    const state = location.state as ApplicantLocationState | null;
    if (state?.applicant && state.applicant.id === applicantId) {
      return state.applicant;
    }

    if (!applicantId) {
      return null;
    }

    return findApplicantById(applicantId) ?? null;
  }, [applicantId, location.state]);

  const handleGoBack = () => {
    navigate(-1);
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
            <span className="text-xs text-gray-400">
              담당자 메모 기본 작성자: {REVIEWER_DISPLAY_NAME}
            </span>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-0 pb-6">
          <RecruitApplicantMain initialApplicant={initialApplicant} />
        </div>
      </div>
    </div>
  );
};

export default RecruitApplicantPage;
