import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRecruitments } from "@/api/recruitment";
import RecruitDetailHeader from "@/widget/recruitdetail/ui/RecruitDetailHeader";
import RecruitDetailMain from "@/widget/recruitdetail/ui/RecruitDetailMain";
import RecruitDetailMainHeader from "@/widget/recruitdetail/ui/RecruitDetailMainHeader";
import RecruitDetailSearch from "@/widget/recruitdetail/ui/RecruitDetailSearch";

const RecruitDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const parsedId = id ? Number(id) : NaN;

  const { data: recruitmentsData } = useQuery({
    queryKey: ["recruitments"],
    queryFn: getRecruitments,
  });

  const recruit = Number.isNaN(parsedId)
    ? undefined
    : recruitmentsData?.data?.find((r) => r.id === parsedId);

  const title = recruit?.name ?? "모집";
  const description = "";

  return (
    <div className="flex h-full w-full flex-col gap-4 py-6 overflow-hidden">
      <RecruitDetailHeader title={title} description={description} />
      <RecruitDetailSearch />
      <RecruitDetailMainHeader />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <RecruitDetailMain />
      </div>
    </div>
  );
};

export default RecruitDetailPage;
