import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import clsx from "clsx";
import {
  createInitialApplicants,
  statusBadgeMap,
  statusLabelMap,
} from "../constants/applicants";
import type { ApplicantDetail } from "../types";

const RecruitDetailMain = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const applicants = useMemo(() => createInitialApplicants(), []);

  const formatSubmittedAt = (submittedAt: string) => {
    const date = new Date(submittedAt);
    if (Number.isNaN(date.getTime())) {
      return submittedAt;
    }

    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yy}.${mm}.${dd}`;
  };

  const handleNavigateApplicant = (applicant: ApplicantDetail) => {
    if (!id) {
      return;
    }

    navigate(`/recruit/detail/${id}/applicant/${applicant.id}`, {
      state: { applicant },
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-6 pr-2">
      {applicants.map((applicant) => (
        <button
          key={applicant.id}
          type="button"
          onClick={() => handleNavigateApplicant(applicant)}
          className="flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-white px-6 py-5 text-left shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
        >
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center gap-3">
              <p className="text-base font-semibold text-gray-900">
                {applicant.name}
              </p>
              <span
                className={clsx(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  statusBadgeMap[applicant.status]
                )}
              >
                {statusLabelMap[applicant.status]}
              </span>
            </div>
            <p className="text-sm text-gray-500">{applicant.appliedTrack}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
              <span>
                {
                  applicant.profile.find((field) => field.label === "전화번호")
                    ?.value
                }
              </span>
              <span>
                {
                  applicant.profile.find((field) => field.label === "이메일")
                    ?.value
                }
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs text-gray-400">
            <span>서류 제출일</span>
            <span className="text-sm font-semibold text-gray-700">
              {formatSubmittedAt(applicant.submittedAt)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default RecruitDetailMain;
