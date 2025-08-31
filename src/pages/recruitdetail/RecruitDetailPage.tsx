import RecruitDetailHeader from "@/widget/recruitdetail/ui/RecruitDetailHeader";
import RecruitDetailMain from "@/widget/recruitdetail/ui/RecruitDetailMain";
import RecruitDetailMainHeader from "@/widget/recruitdetail/ui/RecruitDetailMainHeader";
import RecruitDetailSearch from "@/widget/recruitdetail/ui/RecruitDetailSearch";

const RecruitDetailPage = () => {
  return (
    <div className="flex flex-col w-full h-full gap-4 py-6">
      <RecruitDetailHeader />
      <RecruitDetailSearch />
      <RecruitDetailMainHeader />
      <div className="flex-1 min-h-0">
        <RecruitDetailMain />
      </div>
    </div>
  );
};

export default RecruitDetailPage;
