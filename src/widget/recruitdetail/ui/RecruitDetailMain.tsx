import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import {
  getDocumentScreeningApplications,
  type DocumentScreeningApplicant,
} from "@/api/councilApplications";
import { getInterviewApplicants } from "@/api/councilInterviews";
import { useMyApplications } from "@/api/myApplications";
import { toast } from "sonner";
import { statusBadgeMap, statusLabelMap } from "../constants/applicants";
import { mapEvaluationStatusToApplicantStatus } from "@/lib/applications/statusMeta";

type RecruitDetailMainProps = {
  activeTab: "서류 심사" | "면접";
  onDocumentStateChange: (count: number, allDecided: boolean) => void;
  onInterviewStateChange: (count: number) => void;
};

type ApplicantNavigationPayload = {
  name: string;
  email: string;
  tel?: string;
  appliedAt: string;
  evaluationStatus?: string;
};

const RecruitDetailMain = ({
  activeTab,
  onDocumentStateChange,
  onInterviewStateChange,
}: RecruitDetailMainProps) => {
  const navigate = useNavigate();
  const { councilId, id } = useParams<{ councilId: string; id: string }>();
  const parsedCouncilId = councilId ? Number(councilId) : NaN;
  const hasValidCouncilId = Number.isFinite(parsedCouncilId);
  const parsedRecruitmentId = id ? Number(id) : NaN;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["document-screening", parsedCouncilId],
    queryFn: () => getDocumentScreeningApplications(parsedCouncilId),
    enabled: hasValidCouncilId,
    staleTime: 1000 * 60,
  });

  const applicants = useMemo(() => data?.data ?? [], [data?.data]);
  const {
    data: interviewData,
    isLoading: isInterviewLoading,
    isError: isInterviewError,
    refetch: refetchInterview,
  } = useQuery({
    queryKey: ["interview-applicants", parsedCouncilId],
    queryFn: () => getInterviewApplicants(parsedCouncilId),
    enabled: hasValidCouncilId,
    staleTime: 1000 * 60,
  });
  const interviewApplicants = useMemo(
    () => interviewData?.data ?? [],
    [interviewData?.data]
  );

  const [activeApplicantKey, setActiveApplicantKey] = useState<string | null>(
    null
  );

  const { mutate: fetchApplicantApplications, isPending: isViewerLoading } =
    useMyApplications();

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

  const navigateToApplicantDetail = (
    applicant: ApplicantNavigationPayload,
    viewMode: "document" | "interview"
  ) => {
    if (
      !applicant.name ||
      !applicant.email ||
      Number.isNaN(parsedRecruitmentId) ||
      !councilId ||
      !id
    ) {
      toast.error("지원자 정보를 확인할 수 없습니다.");
      return;
    }

    const applicantKey = `${applicant.email}-${applicant.appliedAt}`;
    setActiveApplicantKey(applicantKey);

    fetchApplicantApplications(
      { name: applicant.name, email: applicant.email },
      {
        onSuccess: (response) => {
          const results = (response.data ?? []).filter(
            (application) => application.recruitmentId === parsedRecruitmentId
          );

          if (results.length === 0) {
            toast.error("해당 모집에 대한 지원서를 찾을 수 없습니다.");
            return;
          }

          const targetApplication = results[0];

          const basePath = `/${councilId}/recruit/detail/${id}/applicant/${targetApplication.applicationId}`;
          const targetPath =
            viewMode === "interview" ? `${basePath}/interview` : basePath;
          navigate(targetPath, {
            state: {
              viewMode,
              applicantInfo: {
                name: applicant.name,
                email: applicant.email,
                tel: applicant.tel,
                appliedAt: applicant.appliedAt,
                evaluationStatus: applicant.evaluationStatus,
              },
            },
          });
        },
        onError: () => {
          toast.error("지원자 지원서를 불러오지 못했습니다.");
        },
        onSettled: () => {
          setActiveApplicantKey(null);
        },
      }
    );
  };
  const handleSelectApplicant = (applicant: DocumentScreeningApplicant) => {
    const applicantKey = `${applicant.email}-${applicant.appliedAt}`;
    setActiveApplicantKey(applicantKey);
    navigateToApplicantDetail(applicant, "document");
  };

  useEffect(() => {
    const total = applicants.length;
    const DECIDED_STATUSES = new Set(["INTERVIEW", "PASSED", "FAILED"]);
    const allDecided =
      total > 0 &&
      applicants.every((applicant) =>
        DECIDED_STATUSES.has(applicant.evaluationStatus)
      );
    onDocumentStateChange(total, allDecided);
  }, [applicants, onDocumentStateChange]);

  useEffect(() => {
    onInterviewStateChange(interviewApplicants.length);
  }, [interviewApplicants, onInterviewStateChange]);

  const renderDocumentContent = () => {
    if (!hasValidCouncilId) {
      return (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-sm text-gray-500">
          유효한 학생회 정보를 확인할 수 없습니다.
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-gray-100 bg-white text-sm text-gray-500">
          서류 심사 목록을 불러오는 중입니다...
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white text-sm text-gray-500">
          서류 심사 목록을 불러오지 못했습니다.
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:border-primary hover:text-primary"
          >
            다시 시도
          </button>
        </div>
      );
    }

    if (applicants.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-sm text-gray-500">
          아직 제출된 지원서가 없습니다.
        </div>
      );
    }

    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-6 pr-2">
        {applicants.map((applicant) => {
          const applicantKey = `${applicant.email}-${applicant.appliedAt}`;
          const isActive =
            activeApplicantKey === applicantKey && isViewerLoading;
          const applicantStatus = mapEvaluationStatusToApplicantStatus(
            applicant.evaluationStatus
          );

          return (
            <button
              key={applicantKey}
              type="button"
              onClick={() => handleSelectApplicant(applicant)}
              className="flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-white px-6 py-5 text-left shadow-sm transition hover:border-primary/40 hover:bg-primary/5 disabled:opacity-60"
              disabled={isActive}
            >
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-3">
                  <p className="text-base font-semibold text-gray-900">
                    {applicant.name}
                  </p>
                  <span
                    className={clsx(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      statusBadgeMap[applicantStatus]
                    )}
                  >
                    {statusLabelMap[applicantStatus]}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {applicant.tel ? `연락처 ${applicant.tel}` : applicant.email}
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>{applicant.tel || "전화번호 없음"}</span>
                  <span>{applicant.email}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs text-gray-400">
                <span>서류 제출일</span>
                <span className="text-sm font-semibold text-gray-700">
                  {isActive
                    ? "불러오는 중..."
                    : formatSubmittedAt(applicant.appliedAt)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderInterviewContent = () => {
    if (!hasValidCouncilId) {
      return (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-sm text-gray-500">
          유효한 학생회 정보를 확인할 수 없습니다.
        </div>
      );
    }

    if (isInterviewLoading) {
      return (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-gray-100 bg-white text-sm text-gray-500">
          면접 대상자를 불러오는 중입니다...
        </div>
      );
    }

    if (isInterviewError) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white text-sm text-gray-500">
          면접 대상자를 불러오지 못했습니다.
          <button
            type="button"
            onClick={() => refetchInterview()}
            className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:border-primary hover:text-primary"
          >
            다시 시도
          </button>
        </div>
      );
    }

    if (interviewApplicants.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-sm text-gray-500">
          아직 면접 대상자가 없습니다.
        </div>
      );
    }

    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-6 pr-2">
        {interviewApplicants.map((applicant) => {
          const key = `${applicant.email}-${applicant.appliedAt}`;
          const isActive = activeApplicantKey === key && isViewerLoading;
          const status = mapEvaluationStatusToApplicantStatus(
            applicant.evaluationStatus
          );
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setActiveApplicantKey(key);
                navigateToApplicantDetail(
                  {
                    name: applicant.name,
                    email: applicant.email,
                    tel: applicant.tel,
                    appliedAt: applicant.appliedAt,
                    evaluationStatus: applicant.evaluationStatus,
                  },
                  "interview"
                );
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-white px-6 py-5 text-left shadow-sm transition hover:border-primary/40 hover:bg-primary/5 disabled:opacity-60"
              disabled={isActive}
            >
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-3">
                  <p className="text-base font-semibold text-gray-900">
                    {applicant.name}
                  </p>
                  <span
                    className={clsx(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      statusBadgeMap[status]
                    )}
                  >
                    {statusLabelMap[status]}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {applicant.tel || applicant.email}
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>{applicant.tel || "전화번호 없음"}</span>
                  <span>{applicant.email}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs text-gray-400">
                <span>면접 대상 등록일</span>
                <span className="text-sm font-semibold text-gray-700">
                  {isActive
                    ? "불러오는 중..."
                    : formatSubmittedAt(applicant.appliedAt)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return activeTab === "면접"
    ? renderInterviewContent()
    : renderDocumentContent();
};

export default RecruitDetailMain;
