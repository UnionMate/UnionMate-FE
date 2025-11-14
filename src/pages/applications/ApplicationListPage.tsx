import { Mail, UserRound } from "lucide-react";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  type MyApplication,
  type MyApplicationsResponse,
  useMyApplications,
} from "@/api/myApplications";
import { toast } from "sonner";
import { getApplicationStatusMeta } from "@/lib/applications/statusMeta";
import { useApplicantInfoStore } from "@/shared/stores/useApplicantInfoStore";

type ApplicantInfo = {
  name: string;
  email: string;
};

const ApplicationListPage = () => {
  const navigate = useNavigate();
  const { name: storedName, email: storedEmail, setApplicantInfo } =
    useApplicantInfoStore();
  const [applicant, setApplicant] = useState<ApplicantInfo | null>(() => {
    if (storedName && storedEmail) {
      return { name: storedName, email: storedEmail };
    }
    return null;
  });
  const [formValues, setFormValues] = useState<ApplicantInfo>({
    name: storedName,
    email: storedEmail,
  });
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const { mutate: requestMyApplications, isPending } = useMyApplications();

  const hasApplications = applications.length > 0;
  const allowModalDismiss = Boolean(applicant);

  const handleInputChange =
    (field: keyof ApplicantInfo) => (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleLookup = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const trimmedEmail = formValues.email.trim();
    const trimmedName = formValues.name.trim();

    if (!trimmedEmail || !trimmedName) {
      toast.error("이메일과 이름을 모두 입력하세요.");
      return;
    }

    requestMyApplications(
      { email: trimmedEmail, name: trimmedName },
      {
        onSuccess: (response: MyApplicationsResponse) => {
          const results = response.data ?? [];

          if (results.length === 0) {
            toast.error(
              "작성한 지원서를 찾을 수 없습니다. 정보를 다시 입력해주세요."
            );
            return;
          }

          setApplicantInfo({ name: trimmedName, email: trimmedEmail });
          setApplicant({ name: trimmedName, email: trimmedEmail });
          setApplications(results);
          setIsModalOpen(false);
        },
        onError: () => {
          toast.error(
            "지원서 조회에 실패했습니다. 입력 정보를 다시 확인해주세요."
          );
        },
      }
    );
  };

  const handleEditClick = (application: MyApplication) => {
    const applicantName = applicant?.name ?? storedName;
    const applicantEmail = applicant?.email ?? storedEmail;
    navigate(`/applications/update/${application.applicationId}`, {
      state: {
        recruitmentId: application.recruitmentId,
        applicantName,
        applicantEmail,
      },
    });
  };

  const modal = isModalOpen ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
      onClick={() => {
        if (allowModalDismiss && !isPending) {
          setIsModalOpen(false);
        }
      }}
    >
      <form
        onSubmit={handleLookup}
        className="relative w-full max-w-md space-y-6 rounded-2xl bg-white px-8 py-10 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-2 text-center">
          <p className="text-2xl font-bold text-gray-900">지원서 조회</p>
          <p className="text-sm text-gray-500">
            지원서 작성 시 입력했던 이름과 이메일을 입력하세요.
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">이메일</p>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={formValues.email}
                onChange={handleInputChange("email")}
                autoComplete="email"
                placeholder="학교 이메일을 입력하세요"
                className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">이름</p>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formValues.name}
                onChange={handleInputChange("name")}
                autoComplete="name"
                placeholder="이름을 입력하세요"
                className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          {allowModalDismiss && (
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isPending}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              취소
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "조회 중..." : "지원서 조회"}
          </button>
        </div>
      </form>
    </div>
  ) : null;

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full items-start justify-center bg-white px-4 py-10">
      <div className="w-full max-w-4xl space-y-10">
        <div className="space-y-3 text-center">
          <p className="text-4xl font-bold text-gray-900">지원서 목록</p>
          <p className="text-lg text-gray-600">
            지원서 작성 시 입력한 정보로 본인 지원 현황을 확인할 수 있어요.
          </p>
        </div>

        {applicant && (
          <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                조회 중인 지원자
              </p>
              <p className="text-xl font-semibold text-gray-900">
                {applicant.name}
              </p>
              <p className="text-sm text-gray-600">{applicant.email}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary hover:text-primary"
            >
              다른 정보로 조회
            </button>
          </div>
        )}

        <div className="space-y-4">
          {hasApplications ? (
            applications.map((application) => {
              const meta = getApplicationStatusMeta(
                application.recruitmentStatus
              );
              const isEditable =
                application.recruitmentStatus === "DOCUMENT_SCREENING";
              const isFinal = application.recruitmentStatus === "FINAL";

              return (
                <div
                  key={application.applicationId}
                  className="rounded-2xl border border-gray-100 p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">
                        지원서 #{application.applicationId}
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {application.recruitmentName}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold ${meta.badgeClass}`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-gray-600">
                    {meta.description}
                  </p>

                  {isEditable ? (
                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleEditClick(application)}
                        className="rounded-xl border border-primary/30 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
                      >
                        지원서 수정
                      </button>
                    </div>
                  ) : isFinal ? (
                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        className="rounded-xl border border-primary/30 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
                      >
                        결과 확인
                      </button>
                    </div>
                  ) : (
                    <div className="mt-6 flex justify-end text-sm font-medium text-gray-400">
                      수정이 제한된 상태입니다.
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center text-gray-500">
              지원서를 조회하면 이곳에서 확인할 수 있어요.
            </div>
          )}
        </div>
      </div>
      {modal}
    </div>
  );
};

export default ApplicationListPage;
