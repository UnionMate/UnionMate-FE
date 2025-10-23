import { BookText, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RecruitDetailHeaderProps {
  title: string;
  description: string;
}

const RecruitDetailHeader = ({
  title,
  description,
}: RecruitDetailHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex">
      <div className="flex gap-5.5 items-start">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex w-6 h-6 pt-2 text-gray-400 hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="이전 페이지로 이동"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1.5 items-center">
            <BookText className="w-6 h-6 text-primary" />
            <div className="flex font-[600] text-[28px] text-black">
              모집 절차 - {title}
              {description && (
                <span className="ml-2 text-gray-600 text-[22px]">
                  {description}
                </span>
              )}
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
