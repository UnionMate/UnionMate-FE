import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  getRecruitmentDetail,
  submitApplication,
  type RecruitmentDetailItem,
  type RecruitmentItemOption,
  type SubmitApplicationRequest,
} from "@/api/recruitment";
import { FIXED_FIELDS } from "@/widget/formEdit/constants";
import ApplicationQuestionCard from "@/widget/recruitmentApply/ui/ApplicationQuestionCard";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

type AnswerValue = string | string[];
type AnswerState = Record<number, AnswerValue>;

const normalizeLabel = (value?: string) => (value ?? "").trim().toLowerCase();

const getOptionKey = (option: RecruitmentItemOption) =>
  String(option.id ?? `order-${option.order}`);

const RecruitmentApplyPage = () => {
  const { recruitmentId } = useParams<{ recruitmentId: string }>();
  const navigate = useNavigate();
  const parsedId = recruitmentId ? Number(recruitmentId) : NaN;
  const hasValidId = Number.isFinite(parsedId);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [applicantInfo, setApplicantInfo] = useState(() =>
    FIXED_FIELDS.reduce<Record<string, string>>((accumulator, field) => {
      accumulator[field.id] = "";
      return accumulator;
    }, {})
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-recruitment-detail", parsedId],
    queryFn: () => getRecruitmentDetail(parsedId),
    enabled: hasValidId,
  });

  const detail = data?.data;

  const fixedLabelSet = useMemo(
    () => new Set(FIXED_FIELDS.map((field) => normalizeLabel(field.label))),
    []
  );

  const sortedItems: RecruitmentDetailItem[] = useMemo(() => {
    const list = detail?.items ?? [];
    return list
      .filter((item) => !fixedLabelSet.has(normalizeLabel(item.title)))
      .sort((a, b) => a.order - b.order);
  }, [detail?.items, fixedLabelSet]);

  const dynamicItems = sortedItems;

  useEffect(() => {
    if (!detail?.items) return;
    const initialAnswers: AnswerState = {};

    dynamicItems.forEach((item) => {
      if (item.type === "SELECT") {
        initialAnswers[item.id] = item.multiple ? [] : "";
      } else if (item.type === "ANNOUNCEMENT") {
        // skip
      } else {
        initialAnswers[item.id] = "";
      }
    });
    setAnswers(initialAnswers);
  }, [detail?.id, detail?.items, dynamicItems]);

  const handleApplicantInfoChange = (fieldId: string, value: string) => {
    if (fieldId === "applicant-phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 11);
      const formatted = digitsOnly.replace(
        /^(\d{0,3})(\d{0,4})(\d{0,4}).*$/,
        (_match, p1, p2, p3) => {
          if (p3) return `${p1}-${p2}-${p3}`;
          if (p2) return `${p1}-${p2}`;
          return p1;
        }
      );
      setApplicantInfo((prev) => ({
        ...prev,
        [fieldId]: formatted,
      }));
      return;
    }
    setApplicantInfo((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleTextChange = (itemId: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleDateChange = (itemId: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleSelectChange = (
    itemId: number,
    optionKey: string,
    multiple: boolean
  ) => {
    setAnswers((prev) => {
      const prevValue = prev[itemId];

      if (multiple) {
        const normalized = Array.isArray(prevValue)
          ? prevValue
          : prevValue
          ? [prevValue]
          : [];

        const exists = normalized.includes(optionKey);
        const next = exists
          ? normalized.filter((key) => key !== optionKey)
          : [...normalized, optionKey];

        return {
          ...prev,
          [itemId]: next,
        };
      }

      return {
        ...prev,
        [itemId]: optionKey,
      };
    });
  };

  const requiredUnansweredCount = useMemo(() => {
    let count = 0;

    FIXED_FIELDS.forEach((field) => {
      const value = applicantInfo[field.id] ?? "";
      if (value.trim().length === 0) {
        count += 1;
      }
    });

    dynamicItems.forEach((item) => {
      if (!item.required || item.type === "ANNOUNCEMENT") return;
      const value = answers[item.id];
      if (item.type === "SELECT") {
        const normalized = Array.isArray(value) ? value : value ? [value] : [];
        if (normalized.length === 0) {
          count += 1;
        }
        return;
      }
      if (item.type === "CALENDAR") {
        if (!(typeof value === "string" && value.trim().length > 0)) {
          count += 1;
        }
        return;
      }
      if (!(typeof value === "string" && value.trim().length > 0)) {
        count += 1;
      }
    });

    return count;
  }, [answers, applicantInfo, dynamicItems]);

  const { mutateAsync: submitApplicationMutate, isPending } = useMutation({
    mutationFn: ({
      recruitmentId: targetRecruitmentId,
      request,
    }: {
      recruitmentId: number;
      request: SubmitApplicationRequest;
    }) => submitApplication(targetRecruitmentId, request),
  });

  const buildSelectedOptionIds = (
    item: RecruitmentDetailItem,
    selectedKeys: string[]
  ) => {
    const optionMap = new Map<string, RecruitmentItemOption>();
    item.options?.forEach((option) => {
      optionMap.set(getOptionKey(option), option);
    });
    return selectedKeys
      .map((key) => optionMap.get(key))
      .filter((option): option is RecruitmentItemOption => Boolean(option))
      .map((option) => option.id)
      .filter((id): id is number => typeof id === "number");
  };

  const handleSubmit = async () => {
    if (!detail || !hasValidId) return;
    if (requiredUnansweredCount > 0) {
      toast.error("필수 질문에 답변을 입력해주세요.");
      return;
    }

    const applicantPayload = {
      name: applicantInfo["applicant-name"] ?? "",
      email: applicantInfo["applicant-email"] ?? "",
      tel: applicantInfo["applicant-phone"] ?? "",
    };

    const answersPayload = dynamicItems
      .filter((item) => item.type !== "ANNOUNCEMENT")
      .map((item) => {
        const value = answers[item.id];
        if (item.type === "SELECT") {
          const normalized = Array.isArray(value)
            ? value
            : value
            ? [value]
            : [];
          const optionIds = buildSelectedOptionIds(item, normalized);
          return {
            itemId: item.id,
            optionIds,
          };
        }
        if (item.type === "CALENDAR") {
          return {
            itemId: item.id,
            date: typeof value === "string" && value.length > 0 ? value : "",
          };
        }
        return {
          itemId: item.id,
          text: typeof value === "string" ? value : "",
        };
      });

    const payloadAnswers = [...answersPayload];

    try {
      await submitApplicationMutate({
        recruitmentId: parsedId,
        request: {
          name: applicantPayload.name,
          email: applicantPayload.email,
          tel: applicantPayload.tel,
          answers: payloadAnswers,
        },
      });

      navigate(`/recruitment/${recruitmentId}/thanks`, {
        replace: true,
        state: { name: detail.name ?? "모집" },
      });
    } catch (error) {
      console.error("지원서 제출 실패:", error);
      toast.error("제출에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const isSubmitDisabled = !detail || isPending || requiredUnansweredCount > 0;

  if (!hasValidId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black-5 px-4 py-10">
        <p className="text-16-semibold text-error">
          올바르지 않은 모집 경로입니다.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black-5 px-4 py-10">
        <p className="text-16-semibold text-black-60">양식을 불러오는 중...</p>
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black-5 px-4 py-10">
        <p className="text-16-semibold text-error">
          지원서를 불러오지 못했습니다. 잠시 후 다시 확인해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black-5 px-4 py-10">
      <Toaster />
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="space-y-2 rounded-3xl border border-primary/20 bg-white px-8 py-6 shadow-[0px_16px_40px_rgba(128,202,20,0.06)]">
          <p className="text-14-semibold text-primary">UnionMate 지원서</p>
          <h1 className="text-title-28-bold text-black-100">{detail.name}</h1>
          {detail.endAt && (
            <p className="text-15-medium text-black-50">
              마감: {new Date(detail.endAt).toLocaleString("ko-KR")}
            </p>
          )}
        </header>

        <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0px_16px_40px_rgba(0,0,0,0.05)]">
          <div className="space-y-4">
            <h2 className="text-title-18-semibold text-black-90">
              지원자 기본 정보
            </h2>
            <div className="flex flex-col gap-4">
              {FIXED_FIELDS.map((field) => (
                <div
                  key={field.id}
                  className="rounded-3xl border border-primary/15 bg-white px-6 py-5 shadow-[0px_12px_24px_rgba(0,0,0,0.04)]"
                >
                  <label className="flex flex-col gap-2">
                    <span className="flex items-center gap-1 text-title-16-semibold text-black-90">
                      {field.label}
                      <span className="text-error">*</span>
                    </span>
                    <input
                      type={field.type}
                      value={applicantInfo[field.id]}
                      onChange={(event) =>
                        handleApplicantInfoChange(field.id, event.target.value)
                      }
                      placeholder={
                        field.id === "applicant-phone"
                          ? "000-0000-0000"
                          : field.placeholder
                      }
                      inputMode={
                        field.id === "applicant-phone" ? "numeric" : undefined
                      }
                      maxLength={
                        field.id === "applicant-phone" ? 13 : undefined
                      }
                      className="rounded-2xl border border-black-15 px-4 py-3 text-15-medium text-black-80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {dynamicItems.map((item) => (
            <ApplicationQuestionCard
              key={item.id}
              item={item}
              value={answers[item.id]}
              onTextChange={(value) => handleTextChange(item.id, value)}
              onDateChange={(value) => handleDateChange(item.id, value)}
              onSelectChange={(optionKey, multiple) =>
                handleSelectChange(item.id, optionKey, multiple)
              }
            />
          ))}
        </section>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className="ml-auto rounded-2xl bg-primary px-10 py-3 text-16-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? "제출 중..." : "지원서 제출"}
        </button>
      </div>
    </div>
  );
};

export default RecruitmentApplyPage;
