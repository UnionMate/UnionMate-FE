import { Toaster } from "@/components/ui/sonner";
import { getRecruitmentDetail } from "@/api/recruitment";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router-dom";

const RecruitmentThankYouPage = () => {
  const { recruitmentId } = useParams<{ recruitmentId: string }>();
  const location = useLocation();
  const stateName = (location.state as { name?: string } | null)?.name;
  const parsedId = recruitmentId ? Number(recruitmentId) : NaN;
  const hasValidId = Number.isFinite(parsedId);

  const { data } = useQuery({
    queryKey: ["public-recruitment-detail", parsedId],
    queryFn: () => getRecruitmentDetail(parsedId),
    enabled: !stateName && hasValidId,
  });

  const formName = stateName ?? data?.data?.name ?? "모집";

  return (
    <div className="flex min-h-screen items-center justify-center bg-black-5 px-4 py-12">
      <Toaster />
      <div className="w-full max-w-lg rounded-3xl bg-white px-8 py-12 text-center shadow-[0px_20px_60px_rgba(0,0,0,0.08)]">
        <p className="text-14-semibold text-primary">제출 완료</p>
        <h1 className="mt-3 text-title-28-bold text-black-100">
          {formName}에 제출해주셔서 감사합니다.
        </h1>
        <p className="mt-4 text-15-regular text-black-60">
          제출이 성공적으로 완료되었습니다. 새로운 브라우저 창을 열지 않는 이상
          이전 페이지로 돌아갈 수 없습니다.
        </p>
      </div>
    </div>
  );
};

export default RecruitmentThankYouPage;
