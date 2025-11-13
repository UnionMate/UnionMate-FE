import {
  getRecruitmentFinalResult,
  type RecruitmentFinalResultResponse,
} from "@/api/recruitment";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";

type StageMeta = {
  badge: string;
  title: string;
  description: string;
  tone: "success" | "warning" | "error" | "default";
  showInterview: boolean;
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
};

const formatTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getStageMeta = (
  status?: string,
  evaluationStatus?: string
): StageMeta => {
  if (status === "INTERVIEW" && evaluationStatus === "SUBMITTED") {
    return {
      badge: "서류 평가 결과",
      title: "서류 평가에 합격하셨습니다.",
      description: "아래 안내된 면접 일정과 장소를 꼭 확인해주세요.",
      tone: "success",
      showInterview: true,
    };
  }
  if (status === "INTERVIEW" && evaluationStatus === "FAILED") {
    return {
      badge: "서류 평가 결과",
      title: "아쉽게도 서류 평가에 통과하지 못했습니다.",
      description:
        "지원해 주신 시간과 정성에 진심으로 감사드리며, 다음 기회에 더 좋은 인연으로 만나뵙길 바랍니다.",
      tone: "error",
      showInterview: false,
    };
  }
  if (status === "FINAL" && evaluationStatus === "PASSED") {
    return {
      badge: "최종 결과",
      title: "최종 합격을 진심으로 축하드립니다!",
      description:
        "추후 안내되는 일정과 공지를 꼭 확인해 주세요. 함께하게 되어 기쁩니다.",
      tone: "success",
      showInterview: false,
    };
  }
  if (status === "FINAL" && evaluationStatus === "FAILED") {
    return {
      badge: "최종 결과",
      title: "아쉽게도 최종 합격자 명단에 들지 못했습니다.",
      description:
        "끝까지 함께해 주신 열정에 감사드리며, 다른 활동에서도 좋은 소식을 응원하겠습니다.",
      tone: "error",
      showInterview: false,
    };
  }
  return {
    badge: "결과 확인",
    title: "결과를 준비하고 있습니다.",
    description: "잠시 후 다시 시도하거나 학생회 담당자에게 문의해 주세요.",
    tone: "warning",
    showInterview: false,
  };
};

const toneClassName: Record<StageMeta["tone"], string> = {
  success: "text-success bg-black-10",
  warning: "text-warning bg-black-10",
  error: "text-error bg-black-10",
  default: "text-black-80 bg-black-10",
};

const RecruitmentFinalResultPage = () => {
  const { recruitmentId } = useParams<{ recruitmentId: string }>();
  const [searchParams] = useSearchParams();
  const decodeParam = (value: string | null) =>
    value ? decodeURIComponent(value).trim() : "";
  const applicantNameParam = decodeParam(searchParams.get("name"));
  const emailParam = decodeParam(searchParams.get("email"));
  const parsedId = recruitmentId ? Number(recruitmentId) : NaN;
  const hasApplicantName = applicantNameParam.length > 0;
  const hasEmail = emailParam.length > 0;
  const canRequest = Number.isFinite(parsedId) && hasApplicantName && hasEmail;

  const { data, isError, isLoading } = useQuery<RecruitmentFinalResultResponse>(
    {
      queryKey: [
        "recruitment-final-result",
        parsedId,
        applicantNameParam,
        emailParam,
      ],
      queryFn: () =>
        getRecruitmentFinalResult(parsedId, {
          applicantName: applicantNameParam,
          email: emailParam,
        }),
      enabled: canRequest,
      retry: 1,
    }
  );

  const result = data?.data;
  const applicantName = result?.applicant?.name ?? applicantNameParam;
  const recruitmentName = result?.recruitment?.recruitmentName ?? "";
  const councilName = result?.councilName ?? "";
  const councilManagerEmail = result?.councilManagerEmail ?? "";
  const stageMeta = useMemo(
    () =>
      getStageMeta(
        result?.stage?.recruitmentStatus,
        result?.stage?.evaluationStatus
      ),
    [result?.stage?.evaluationStatus, result?.stage?.recruitmentStatus]
  );

  const renderStateMessage = () => {
    if (!canRequest) {
      return {
        title: "필수 정보가 누락되었습니다.",
        description:
          "올바른 결과 안내 페이지를 이용하려면 링크에 포함된 이름과 이메일이 필요합니다.",
      };
    }
    if (isLoading) {
      return {
        title: "결과를 불러오는 중입니다.",
        description: "잠시만 기다려 주세요.",
      };
    }
    if (isError) {
      return {
        title: "결과를 불러오지 못했습니다.",
        description: "잠시 후 다시 시도하거나 학생회 담당자에게 문의해 주세요.",
      };
    }
    if (!result) {
      return {
        title: "결과 정보를 찾을 수 없습니다.",
        description: "신청 정보를 다시 확인한 뒤 다시 접속해 주세요.",
      };
    }
    return null;
  };

  const stateMessage = renderStateMessage();

  return (
    <div className="relative min-h-screen bg-black-5">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="hidden h-[420px] w-[420px] rounded-full bg-primary/5 blur-[140px] md:block" />
      </div>
      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-12">
        <div className="w-full rounded-3xl bg-white px-8 py-14 text-center shadow-[0px_30px_80px_rgba(0,0,0,0.08)]">
          {stateMessage ? (
            <div className="space-y-6">
              <p className="text-16-semibold text-primary">모집 결과 안내</p>
              <h1 className="text-[40px] font-bold leading-tight text-black-100 md:text-[44px]">
                {stateMessage.title}
              </h1>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-black-60 md:text-[19px]">
                {stateMessage.description}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-7">
                <p
                  className={`inline-flex items-center justify-center rounded-full px-5 py-1.5 text-[14px] font-semibold ${
                    toneClassName[stageMeta.tone]
                  }`}
                >
                  {stageMeta.badge}
                </p>
                <div className="space-y-2">
                  <p className="text-[32px] font-semibold text-black-80 md:text-[32px]">
                    {applicantName}님
                  </p>
                  <h1 className="mx-auto max-w-full text-[32px] font-extrabold leading-tight text-black-100 md:text-[30px]">
                    {stageMeta.title}
                  </h1>
                  <p className="mx-auto max-w-2xl text-[17px] leading-8 text-black-60 md:text-[18px]">
                    {stageMeta.description}
                  </p>
                </div>
              </div>

              <div className="mt-12 flex flex-col items-center gap-8 text-center">
                <section className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black-40">
                    지원 전형
                  </p>
                  <p className="max-w-full truncate text-title-16-semibold text-black-100 md:text-title-18-semibold">
                    {recruitmentName || "모집 전형"}
                  </p>
                  <p className="max-w-full truncate text-13-regular text-black-60 md:text-14-regular">
                    {formatDateTime(result?.interview?.time)}
                  </p>
                </section>

                {stageMeta.showInterview && (
                  <section className="space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black-40">
                      면접 안내
                    </p>
                    <p className="max-w-full truncate text-title-16-semibold text-black-100 md:text-title-18-semibold">
                      {formatDate(result?.interview?.time)}
                    </p>
                    <p className="max-w-full truncate text-13-regular text-black-60 md:text-14-regular">
                      {formatTime(result?.interview?.time)}
                    </p>
                    <p className="max-w-full truncate text-13-regular text-black-80 md:text-14-regular">
                      장소: {result?.interview?.place || "추후 공지 예정"}
                    </p>
                    <p className="max-w-full truncate text-11-regular text-black-50 md:text-12-regular">
                      일정 변경이 필요하다면 담당자에게 사전에 문의해 주세요.
                    </p>
                  </section>
                )}

                <div className="h-px w-20 bg-black-10" />

                <section className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black-40">
                    문의처
                  </p>
                  <p className="max-w-full truncate text-title-16-semibold text-black-100 md:text-title-18-semibold">
                    {councilName || "학생회"}
                  </p>
                  <p className="max-w-full truncate text-13-regular text-black-60 md:text-14-regular">
                    {councilManagerEmail ||
                      "담당자 이메일을 통해 문의해 주세요."}
                  </p>
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruitmentFinalResultPage;
