import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRecruitmentDetail } from "@/features/recruitment/api/recruitment";
import { convertRecruitmentDetailToFormData } from "@/api/formDataConverter";
import { useFormEditContext } from "@/widget/formEdit/context/useFormEditContext";
import FormEditPage from "./FormEditPage";

const FormUpdatePage = () => {
  const { recruitmentId } = useParams<{ recruitmentId: string }>();
  const {
    setName,
    setEndDate,
    setEndTime,
    setQuestions,
  } = useFormEditContext();

  const parsedId = recruitmentId ? Number(recruitmentId) : NaN;
  const hasValidId = Number.isFinite(parsedId);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["recruitment-detail", parsedId],
    queryFn: () => getRecruitmentDetail(parsedId),
    enabled: hasValidId,
  });

  useEffect(() => {
    if (!data?.data) return;
    const { name, endDate, endTime, questions } = convertRecruitmentDetailToFormData(
      data.data
    );
    setName(name);
    setEndDate(endDate);
    setEndTime(endTime);
    setQuestions(questions);
  }, [data, setEndDate, setEndTime, setName, setQuestions]);

  if (!hasValidId) {
    return (
      <div className="flex h-full w-full items-center justify-center text-16-semibold text-gray-500">
        잘못된 모집 정보입니다.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-16-semibold text-gray-500">
        양식을 불러오는 중입니다...
      </div>
    );
  }

  if (isError || !data?.data) {
    console.error("Failed to fetch recruitment detail", error);
    return (
      <div className="flex h-full w-full items-center justify-center text-16-semibold text-error">
        양식을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
      </div>
    );
  }

  return <FormEditPage />;
};

export default FormUpdatePage;
