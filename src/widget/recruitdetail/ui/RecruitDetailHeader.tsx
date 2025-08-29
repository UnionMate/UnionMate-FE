import { BookText, ChevronLeft } from "lucide-react";

const RecruitDetailHeader = () => {
  return (
    <div className="flex">
      <div className="flex gap-5.5 items-start">
        <div className="flex w-6 h-6 pt-2">
          <ChevronLeft className="w-6 h-6 text-gray-400" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1.5 items-center">
            <BookText className="w-6 h-6 text-primary" />
            <div className="flex font-[600] text-[28px] text-black">
              모집 절차 - Union 1기 개발자
            </div>
          </div>
          <div className="flex text-16-medium text-gray-500">
            모집 절차 별 지원자의 평가 상태를 확인합니다.
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitDetailHeader;
