import RecruitDetailHeader from "@/widget/recruitdetail/ui/RecruitDetailHeader";
import RecruitDetailMain from "@/widget/recruitdetail/ui/RecruitDetailMain";
import RecruitDetailSearch from "@/widget/recruitdetail/ui/RecruitDetailSearch";

const RecruitDetailPage = () => {
  return (
    <div className="flex flex-col w-full h-full gap-4">
      <RecruitDetailHeader />
      <RecruitDetailSearch />
      <RecruitDetailMain />
    </div>
  );
};

export default RecruitDetailPage;
