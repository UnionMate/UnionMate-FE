import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getApplicationDetail,
  updateApplication,
  type ApplicationAnswerDetail,
} from "@/api/application";
import {
  getRecruitmentDetail,
  type RecruitmentDetailItem,
  type RecruitmentItemOption,
  type SubmitApplicationRequest,
} from "@/features/recruitment/api/recruitment";
import { FIXED_FIELDS } from "@/widget/formEdit/constants";
import ApplicationQuestionCard from "@/widget/recruitmentApply/ui/ApplicationQuestionCard";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useApplicantInfoStore } from "@/shared/stores/useApplicantInfoStore";

type AnswerValue = string | string[];
type AnswerState = Record<number, AnswerValue>;

const normalizeLabel = (value?: string) => (value ?? "").trim().toLowerCase();

const getOptionKey = (option: RecruitmentItemOption) =>
  String(option.id ?? `order-${option.order}`);

const extractSelectedOptionKeys = (
  item: RecruitmentDetailItem,
  answer?: ApplicationAnswerDetail
) => {
  if (!answer || !item.options?.length) return [];

  const optionMap = new Map<number, RecruitmentItemOption>();
  const optionTitleMap = new Map<string, RecruitmentItemOption>();

  item.options.forEach((option) => {
    if (typeof option.id === "number") {
      optionMap.set(option.id, option);
    }
    if (option.title) {
      optionTitleMap.set(option.title.trim(), option);
    }
  });

  const byIds =
    answer.selectedOptionIds
      ?.map((id) => optionMap.get(id))
      .filter((option): option is RecruitmentItemOption => Boolean(option))
      .map((option) => getOptionKey(option)) ?? [];
  if (byIds.length > 0) return byIds;

  const byTitles =
    answer.selectedOptionTitles
      ?.map((title) => optionTitleMap.get(title.trim()))
      .filter((option): option is RecruitmentItemOption => Boolean(option))
      .map((option) => getOptionKey(option)) ?? [];
  if (byTitles.length > 0) return byTitles;

  const hasSelectionFlags =
    answer.selectOptions?.some(
      (option) =>
        option.selected !== undefined ||
        option.isSelected !== undefined ||
        option.checked !== undefined
    ) ?? false;

  const bySelectOptions =
    answer.selectOptions
      ?.filter((option) =>
        hasSelectionFlags
          ? option.selected || option.isSelected || option.checked
          : true
      )
      .map((option) => {
        if (option.optionId && optionMap.has(option.optionId)) {
          return getOptionKey(optionMap.get(option.optionId)!);
        }
        if (option.title) {
          const matched = optionTitleMap.get(option.title.trim());
          if (matched) return getOptionKey(matched);
        }
        return null;
      })
      .filter((key): key is string => Boolean(key)) ?? [];

  return bySelectOptions;
};

const normalizeSelectValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed as string[];
      } catch {
        // ignore parse errors
      }
    }
    return trimmed.length > 0 ? [trimmed] : [];
  }
  return [];
};

const ApplicationEditPage = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as
    | {
        recruitmentId?: number;
        applicantName?: string;
        applicantEmail?: string;
      }
    | undefined;
  const {
    name: storeApplicantName,
    email: storeApplicantEmail,
    setApplicantInfo,
  } = useApplicantInfoStore();
  const applicantIdentity = useMemo(
    () => ({
      name: (storeApplicantName || locationState?.applicantName || "").trim(),
      email: (
        storeApplicantEmail ||
        locationState?.applicantEmail ||
        ""
      ).trim(),
    }),
    [
      storeApplicantName,
      storeApplicantEmail,
      locationState?.applicantName,
      locationState?.applicantEmail,
    ]
  );
  const parsedId = applicationId ? Number(applicationId) : NaN;
  const hasValidId = Number.isFinite(parsedId);
  const hasApplicantIdentity =
    applicantIdentity.name.length > 0 && applicantIdentity.email.length > 0;
  const [answers, setAnswers] = useState<AnswerState>({});
  const [fixedAnswers, setFixedAnswers] = useState<AnswerState>({});
  const [defaultFixedAnswers, setDefaultFixedAnswers] = useState<
    Record<string, string>
  >(() =>
    FIXED_FIELDS.reduce<Record<string, string>>((accumulator, field) => {
      accumulator[field.id] = "";
      return accumulator;
    }, {})
  );

  useEffect(() => {
    if (
      (!storeApplicantName || !storeApplicantEmail) &&
      locationState?.applicantName &&
      locationState?.applicantEmail
    ) {
      setApplicantInfo({
        name: locationState.applicantName,
        email: locationState.applicantEmail,
      });
    }
  }, [
    locationState?.applicantEmail,
    locationState?.applicantName,
    setApplicantInfo,
    storeApplicantEmail,
    storeApplicantName,
  ]);

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "application-detail",
      parsedId,
      applicantIdentity.name,
      applicantIdentity.email,
    ],
    queryFn: () =>
      getApplicationDetail(parsedId, {
        name: applicantIdentity.name,
        email: applicantIdentity.email,
      }),
    enabled: hasValidId && hasApplicantIdentity,
  });

  const detail = data?.data;

  const resolvedRecruitmentId = useMemo(() => {
    if (typeof locationState?.recruitmentId === "number") {
      return locationState.recruitmentId;
    }
    if (typeof detail?.recruitmentId === "number") {
      return detail.recruitmentId;
    }
    return undefined;
  }, [locationState?.recruitmentId, detail?.recruitmentId]);

  const {
    data: recruitmentDetail,
    isLoading: isRecruitmentLoading,
    isError: isRecruitmentError,
  } = useQuery({
    queryKey: ["application-edit-recruitment-detail", resolvedRecruitmentId],
    queryFn: () => getRecruitmentDetail(resolvedRecruitmentId!),
    enabled: Number.isFinite(resolvedRecruitmentId),
  });

  const sortedItems: RecruitmentDetailItem[] = useMemo(() => {
    return [...(recruitmentDetail?.data.items ?? [])].sort(
      (a, b) => a.order - b.order
    );
  }, [recruitmentDetail?.data.items]);

  const fixedFieldEntries = useMemo(() => {
    const usedIds = new Set<number>();
    const matchesFieldTitle = (title: string, normalizedLabel: string) => {
      const normalizedTitle = normalizeLabel(title);
      return (
        normalizedTitle === normalizedLabel ||
        normalizedTitle.includes(normalizedLabel)
      );
    };

    return FIXED_FIELDS.map((field) => {
      const normalizedLabel = normalizeLabel(field.label);
      const byLabel = sortedItems.find(
        (item) =>
          matchesFieldTitle(item.title, normalizedLabel) &&
          !usedIds.has(item.id)
      );

      if (byLabel) {
        usedIds.add(byLabel.id);
        return { field, item: byLabel };
      }

      return { field, item: null };
    });
  }, [sortedItems]);

  const fixedItems = useMemo(
    () =>
      fixedFieldEntries
        .map(({ item }) => item)
        .filter((item): item is RecruitmentDetailItem => Boolean(item)),
    [fixedFieldEntries]
  );

  const fixedItemFieldMap = useMemo(() => {
    const map = new Map<number, string>();
    fixedFieldEntries.forEach(({ field, item }) => {
      if (item) {
        map.set(item.id, field.id);
      }
    });
    return map;
  }, [fixedFieldEntries]);

  const fixedItemIdSet = useMemo(
    () => new Set(fixedItems.map((item) => item.id)),
    [fixedItems]
  );

  const dynamicItems = useMemo(
    () => sortedItems.filter((item) => !fixedItemIdSet.has(item.id)),
    [sortedItems, fixedItemIdSet]
  );

  const answerMapById = useMemo(() => {
    const map = new Map<number, ApplicationAnswerDetail>();
    detail?.answers?.forEach((answer) => {
      if (typeof answer.recruitmentItemId === "number") {
        map.set(answer.recruitmentItemId, answer);
      }
    });
    return map;
  }, [detail?.answers]);

  const answerMapByOrder = useMemo(() => {
    const map = new Map<number, ApplicationAnswerDetail>();
    detail?.answers?.forEach((answer) => {
      if (typeof answer.order === "number") {
        map.set(answer.order, answer);
      }
    });
    return map;
  }, [detail?.answers]);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!detail) return;
    setDefaultFixedAnswers((previous) => ({
      ...previous,
      "applicant-name": detail.name ?? "",
      "applicant-email": detail.email ?? "",
      "applicant-phone": detail.tel ?? "",
    }));
  }, [detail]);

  useEffect(() => {
    if (!detail || sortedItems.length === 0 || isInitialized) return;

    const initialFixed: AnswerState = {};
    fixedItems.forEach((item) => {
      const answer =
        answerMapById.get(item.id) ?? answerMapByOrder.get(item.order);
      if (!answer) {
        initialFixed[item.id] = "";
        return;
      }

      if (item.type === "CALENDAR") {
        initialFixed[item.id] = answer.date ?? "";
        return;
      }

      if (item.type === "SELECT") {
        const selectedKeys = extractSelectedOptionKeys(item, answer);
        initialFixed[item.id] = item.multiple
          ? selectedKeys
          : selectedKeys[0] ?? "";
        return;
      }

      const fieldId = fixedItemFieldMap.get(item.id);
      const fallbackValue =
        fieldId === "applicant-name"
          ? detail?.name ?? ""
          : fieldId === "applicant-email"
          ? detail?.email ?? ""
          : fieldId === "applicant-phone"
          ? detail?.tel ?? ""
          : detail?.name ?? "";

      const textValue =
        answer.text ?? answer.answer ?? answer.value ?? fallbackValue;
      initialFixed[item.id] = textValue;
    });

    const initialAnswers: AnswerState = {};
    dynamicItems.forEach((item) => {
      const answer =
        answerMapById.get(item.id) ?? answerMapByOrder.get(item.order);
      if (!answer) {
        if (item.type === "SELECT") {
          initialAnswers[item.id] = item.multiple ? [] : "";
        } else if (item.type === "ANNOUNCEMENT") {
          // announcement 항목은 입력 값이 없습니다.
        } else {
          initialAnswers[item.id] = "";
        }
        return;
      }

      if (item.type === "SELECT") {
        const selectedKeys = extractSelectedOptionKeys(item, answer);
        initialAnswers[item.id] = item.multiple
          ? selectedKeys
          : selectedKeys[0] ?? "";
        return;
      }

      if (item.type === "CALENDAR") {
        initialAnswers[item.id] = answer.date ?? "";
        return;
      }

      if (item.type !== "ANNOUNCEMENT") {
        initialAnswers[item.id] =
          answer.text ?? answer.answer ?? answer.value ?? "";
      }
    });

    setFixedAnswers(initialFixed);
    setAnswers(initialAnswers);
    setIsInitialized(true);
  }, [
    detail,
    isInitialized,
    sortedItems.length,
    fixedItems,
    fixedItemFieldMap,
    dynamicItems,
    answerMapById,
    answerMapByOrder,
  ]);

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

  const handleFixedAnswerChange = (itemId: number, value: AnswerValue) => {
    setFixedAnswers((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleDefaultFixedAnswerChange = (fieldId: string, value: string) => {
    setDefaultFixedAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const requiredUnansweredCount = useMemo(() => {
    let count = 0;

    dynamicItems.forEach((item) => {
      if (!item.required || item.type === "ANNOUNCEMENT") return;

      const value = answers[item.id];
      if (item.type === "SELECT") {
        const normalized = normalizeSelectValue(value);
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

    fixedItems.forEach((item) => {
      if (!item.required) return;
      const rawValue = fixedAnswers[item.id];
      const value =
        item.type === "SELECT"
          ? normalizeSelectValue(rawValue)
          : rawValue ?? "";

      if (Array.isArray(value)) {
        if (value.length === 0) {
          count += 1;
        }
        return;
      }

      if (typeof value === "string" && value.trim().length === 0) {
        count += 1;
      }
    });

    fixedFieldEntries
      .filter(({ item }) => !item)
      .forEach(({ field }) => {
        const value = defaultFixedAnswers[field.id] ?? "";
        if (value.trim().length === 0) {
          count += 1;
        }
      });

    return count;
  }, [
    answers,
    fixedAnswers,
    fixedItems,
    dynamicItems,
    fixedFieldEntries,
    defaultFixedAnswers,
  ]);

  const { mutateAsync: updateApplicationMutate, isPending } = useMutation({
    mutationFn: ({
      applicationId: targetApplicationId,
      request,
      identity,
    }: {
      applicationId: number;
      request: SubmitApplicationRequest;
      identity: { name: string; email: string };
    }) => updateApplication(targetApplicationId, request, identity),
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

    const applicantInfo = FIXED_FIELDS.reduce(
      (accumulator, field) => {
        const entry = fixedFieldEntries.find(
          ({ field: entryField }) => entryField.id === field.id
        );

        let value: string | string[] = entry?.item
          ? fixedAnswers[entry.item.id] ?? ""
          : defaultFixedAnswers[field.id] ?? "";

        if (typeof value === "string" && value.startsWith("[")) {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              value = parsed;
            }
          } catch {
            // ignore JSON parse errors
          }
        }

        const normalizedValue = Array.isArray(value) ? value.join(", ") : value;

        if (field.id === "applicant-name") accumulator.name = normalizedValue;
        if (field.id === "applicant-email") accumulator.email = normalizedValue;
        if (field.id === "applicant-phone") accumulator.tel = normalizedValue;

        return accumulator;
      },
      { name: "", email: "", tel: "" }
    );

    const fixedAnswersPayload = fixedItems
      .filter((item) => item.type !== "ANNOUNCEMENT")
      .map((item) => {
        const value: string | string[] = fixedAnswers[item.id] ?? "";

        if (item.type === "SELECT") {
          const normalized = normalizeSelectValue(value);
          const optionIds = buildSelectedOptionIds(item, normalized);
          return {
            itemId: item.id,
            optionIds,
          };
        }

        if (item.type === "CALENDAR") {
          return {
            itemId: item.id,
            date: typeof value === "string" ? value : "",
          };
        }

        return {
          itemId: item.id,
          text: typeof value === "string" ? value : "",
        };
      });

    const answersPayload = dynamicItems
      .filter((item) => item.type !== "ANNOUNCEMENT")
      .map((item) => {
        const value = answers[item.id];

        if (item.type === "SELECT") {
          const normalized = normalizeSelectValue(value);
          const optionIds = buildSelectedOptionIds(item, normalized);
          return {
            itemId: item.id,
            optionIds,
          };
        }

        if (item.type === "CALENDAR") {
          return {
            itemId: item.id,
            date: typeof value === "string" ? value : "",
          };
        }

        return {
          itemId: item.id,
          text: typeof value === "string" ? value : "",
        };
      });

    const payloadAnswers = [...fixedAnswersPayload, ...answersPayload];

    try {
      await updateApplicationMutate({
        applicationId: parsedId,
        request: {
          name: applicantInfo.name,
          email: applicantInfo.email,
          tel: applicantInfo.tel,
          answers: payloadAnswers,
        },
        identity: applicantIdentity,
      });

      toast.success("지원서가 수정되었습니다.");
      navigate("/applications", {
        replace: true,
        state: { refreshed: true, applicationId: parsedId },
      });
      if (typeof window !== "undefined") {
        // ensure latest 데이터로 새로고침
        setTimeout(() => window.location.reload(), 0);
      }
    } catch (error) {
      console.error("지원서 수정 실패:", error);
      toast.error("지원서 수정에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const isSubmitDisabled =
    !detail ||
    !resolvedRecruitmentId ||
    !recruitmentDetail?.data ||
    isPending ||
    requiredUnansweredCount > 0;

  if (!hasValidId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black-5 px-4 py-10">
        <p className="text-16-semibold text-error">
          올바르지 않은 지원서 경로입니다.
        </p>
      </div>
    );
  }

  if (!hasApplicantIdentity) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black-5 px-4 py-10">
        <div className="max-w-lg space-y-4 text-center">
          <p className="text-title-24-bold text-black-100">
            지원자 정보를 확인할 수 없습니다.
          </p>
          <p className="text-15-medium text-black-60">
            지원서 조회를 위해 이름과 이메일이 필요합니다. 지원서 조회
            페이지에서 다시 로그인해 주세요.
          </p>
          <button
            type="button"
            onClick={() => navigate("/applications")}
            className="rounded-2xl bg-primary px-6 py-3 text-16-semibold text-white transition hover:bg-primary/90"
          >
            지원서 조회로 이동
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || isRecruitmentLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black-5 px-4 py-10">
        <p className="text-16-semibold text-black-60">
          지원서를 불러오는 중...
        </p>
      </div>
    );
  }

  if (isError || isRecruitmentError || !detail || !recruitmentDetail?.data) {
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
          <h1 className="text-title-28-bold text-black-100">
            {detail.recruitmentName}
          </h1>
          {recruitmentDetail.data.endAt && (
            <p className="text-15-medium text-black-50">
              마감:{" "}
              {new Date(recruitmentDetail.data.endAt).toLocaleString("ko-KR")}
            </p>
          )}
        </header>

        <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0px_16px_40px_rgba(0,0,0,0.05)]">
          <div className="space-y-4">
            <h2 className="text-title-18-semibold text-black-90">
              지원자 기본 정보
            </h2>
            <div className="flex flex-col gap-4">
              {fixedFieldEntries.map(({ field, item }, index) => {
                const hasItem = Boolean(item);
                const key = hasItem
                  ? String(item?.id)
                  : `synthetic-${field.id}`;
                const question: RecruitmentDetailItem =
                  item ??
                  ({
                    id: -(index + 1),
                    type: "TEXT",
                    required: true,
                    title: field.label,
                    order: index + 1,
                    description: field.placeholder ?? "",
                  } as RecruitmentDetailItem);

                return (
                  <ApplicationQuestionCard
                    key={key}
                    item={question}
                    value={
                      hasItem
                        ? fixedAnswers[item!.id]
                        : defaultFixedAnswers[field.id]
                    }
                    onTextChange={(value) => {
                      if (hasItem && item) {
                        handleFixedAnswerChange(item.id, value);
                      } else {
                        handleDefaultFixedAnswerChange(field.id, value);
                      }
                    }}
                    onDateChange={() => undefined}
                    onSelectChange={() => undefined}
                  />
                );
              })}
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
          {isPending ? "수정 중..." : "지원서 수정하기"}
        </button>
      </div>
    </div>
  );
};

export default ApplicationEditPage;
