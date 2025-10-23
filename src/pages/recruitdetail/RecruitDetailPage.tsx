import { useParams } from "react-router-dom";
import RecruitDetailHeader from "@/widget/recruitdetail/ui/RecruitDetailHeader";
import RecruitDetailMain from "@/widget/recruitdetail/ui/RecruitDetailMain";
import RecruitDetailMainHeader from "@/widget/recruitdetail/ui/RecruitDetailMainHeader";
import RecruitDetailSearch from "@/widget/recruitdetail/ui/RecruitDetailSearch";
import { getRecruitById } from "@/widget/recruit/constants/recruitCardList";

const RecruitDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const parsedId = id ? Number(id) : NaN;
  const recruit = Number.isNaN(parsedId) ? undefined : getRecruitById(parsedId);

  const title = recruit?.title ?? "모집";
  const description = recruit?.description ?? "";

  return (
    <div className="flex flex-col w-full h-full gap-4 py-6">
      <RecruitDetailHeader title={title} description={description} />
      <RecruitDetailSearch />
      <RecruitDetailMainHeader />
      <div className="flex-1 min-h-0">
        <RecruitDetailMain />
      </div>
    </div>
  );
};

export default RecruitDetailPage;
