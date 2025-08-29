import { Plus } from "lucide-react";

const RecruitButton = () => {
  return (
    <div className="flex justify-end">
      <div className="flex px-3 py-1 bg-primary rounded-sm">
        <div className="flex gap-1 items-center justify-center">
          <Plus className="w-4.5 h-4.5 text-white" />
          <div className="flex text-title-16-semibold text-white">
            모집 추가
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitButton;
