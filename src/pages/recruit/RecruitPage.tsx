import RecruitButton from "@/widget/recruit/ui/RecruitButton";
import RecruitHeader from "@/widget/recruit/ui/RecruitHeader";
import RecruitMain from "@/widget/recruit/ui/RecruitMain";

const RecruitPage = () => {
  return (
    <div className="flex flex-col w-full h-full gap-4">
      <RecruitHeader />
      <RecruitButton />
      <RecruitMain />
    </div>
  );
};

export default RecruitPage;
