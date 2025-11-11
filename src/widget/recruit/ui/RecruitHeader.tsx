import { Users } from "lucide-react";

const RecruitHeader = () => {
  return (
    <div className="flex gap-6">
      <div className="flex gap-2 items-center">
        <Users className="w-8 h-8 text-primary" />
        <div className="flex text-[28px] font-semibold">모집</div>
      </div>
      <div className="flex text-16-medium items-center text-gray-400">
        학생회 모집과 지원서 양식을 연결하여 모집을 진행할 수 있습니다.
      </div>
    </div>
  );
};

export default RecruitHeader;
